import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voice, setVoice] = useState("en-US-AriaNeural");

  const uploadPDF = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("voice", voice);
    setProgress(0);
    setLoading(true);
    let progress = 0;
    let timer;
    try {
      timer = setInterval(() => {
        progress += 8;

        if (progress >= 90) {
          progress = 90;
        }

        setProgress(progress);
      }, 1200);

      const response = await axios.post(
  `${import.meta.env.VITE_API_URL}/upload`,
  formData
);
      clearInterval(timer);

      setProgress(100);

      setAudioUrl(
  `${import.meta.env.VITE_API_URL}${response.data.audio_url}`
);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      clearInterval(timer);

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center pt-10 md:items-center md:pt-0 px-4">
      <div className="w-full max-w-md md:max-w-xl bg-white rounded-3xl shadow-xl p-5 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">PDF → Audio</h1>

        <p className="text-center text-gray-500 mb-6">
          Upload a PDF and convert it into an audiobook.
        </p>

        <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-6 md:p-10 
        text-center cursor-pointer hover:border-blue-500 transition">
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
        {/* ADD */}
        {loading && (
          <div className="mt-6 border rounded-xl p-5 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Generating Audio...</span>

              <span className="text-sm text-gray-500">{progress}%</span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Large PDFs may take up to 2 minutes.
            </p>
          </div>
        )}
        <button
          onClick={uploadPDF}
          disabled={loading || !file}
          className="w-full mt-5 bg-black text-white py-3 rounded-xl hover:opacity-90 disabled:opacity-50"
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
