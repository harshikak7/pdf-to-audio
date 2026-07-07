import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState("en-US-AriaNeural");

  const uploadPDF = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("voice", voice);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
      );

      setAudioUrl(`http://127.0.0.1:8000${response.data.audio_url}`);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-2">PDF → Audio</h1>

        <p className="text-center text-gray-500 mb-8">
          Upload a PDF and convert it into an audiobook.
        </p>

        <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-500 transition">
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file ? (
            <>
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-gray-500 mt-2">Ready to convert</p>
            </>
          ) : (
            <>
              <p className="font-semibold">Click to upload PDF</p>
              <p className="text-sm text-gray-500 mt-2">
                Drag & drop supported
              </p>
            </>
          )}
        </label>
        <div className="mt-6">
          <label className="block font-medium mb-2">Select Voice</label>

          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3"
          >
            <option value="en-US-AriaNeural">🇺🇸 English (Female)</option>

            <option value="en-US-GuyNeural">🇺🇸 English (Male)</option>

            <option value="en-IN-NeerjaNeural">
              🇮🇳 Indian English (Female)
            </option>

            <option value="en-IN-PrabhatNeural">
              🇮🇳 Indian English (Male)
            </option>

            <option value="en-GB-SoniaNeural">
              🇬🇧 British English (Female)
            </option>

            <option value="en-GB-RyanNeural">🇬🇧 British English (Male)</option>
          </select>
        </div>

        <button
          onClick={uploadPDF}
          disabled={loading || !file}
          className="w-full mt-6 bg-black text-white py-3 rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Generating Audio..." : "Convert PDF"}
        </button>

        {audioUrl && (
          <div className="mt-8">
            <h2 className="font-semibold mb-4">Audio Ready</h2>

            <audio controls className="w-full" src={audioUrl} />

            <a
              href={audioUrl}
              download
              className="block text-center mt-4 bg-green-600 text-white py-3 rounded-xl"
            >
              Download MP3
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
