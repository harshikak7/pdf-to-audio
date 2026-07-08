from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import fitz
import edge_tts
import os
import uuid

app = FastAPI()

# Create directories
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://pdf-to-audio-mp3.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated audio
app.mount(
    "/audio",
    StaticFiles(directory=OUTPUT_DIR),
    name="audio"
)

# Helpers
def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)

    text = ""

    for page in doc:
        text += page.get_text()

    doc.close()

    return text

def chunk_text(text: str, chunk_size: int = 4000):
    return [
        text[i:i + chunk_size]
        for i in range(0, len(text), chunk_size)
    ]

async def generate_speech(text: str, output_file: str, voice: str):
    communicate = edge_tts.Communicate(
        text=text,
        voice=voice
    )

    await communicate.save(output_file)

# Routes
@app.get("/")
def root():
    return {
        "message": "PDF to Audio API Running"
    }

@app.get("/download/{filename}")
def download_audio(filename: str):

    file_path = os.path.join(OUTPUT_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=filename
    )

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    voice: str = Form("en-US-AriaNeural")
):

    # Validate file
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file"
        )

    unique_id = str(uuid.uuid4())

    pdf_path = os.path.join(
        UPLOAD_DIR,
        f"{unique_id}.pdf"
    )

    # Save uploaded PDF
    with open(pdf_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        text = extract_text_from_pdf(pdf_path)

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found in PDF"
            )

        chunks = chunk_text(text, 4000)

        combined_text = "\n".join(chunks)

        audio_filename = f"{unique_id}.mp3"

        audio_path = os.path.join(
            OUTPUT_DIR,
            audio_filename
        )

        await generate_speech(
            combined_text,
            audio_path,
            voice
        )

        return {
            "success": True,
            "audio_url": f"/audio/{audio_filename}",
            "pages_processed": len(fitz.open(pdf_path)),
            "voice_used": voice
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )