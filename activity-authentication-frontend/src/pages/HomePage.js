import { useNavigate } from 'react-router';
import { UseAuthentication } from '../hooks/useAuthentication';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

function HomePage() {
  const navigate = useNavigate();
  const auth = UseAuthentication();
  const username = localStorage.getItem("user");

  const role = localStorage.getItem("role");

  const [files, setFiles] = useState([]);


  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(""); 

  function handleLogout() {
    auth.logout().then(() => navigate('/'));
  }

  useEffect(() => {
  axios.get('http://localhost:3000/files', { withCredentials: true })
    .then(response => setFiles(response.data))
    .catch(err => console.error(err));
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };


  const handleFileUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus("Uploading...");


      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setUploadStatus("File uploaded successfully!");
    } catch (error) {
      setUploadStatus("File upload failed.");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="text-3xl font-bold text-slate-500 mb-6 text-center">
        Welcome, {username || "Guest"}!
      </div>

      <button
        onClick={handleLogout}
        className="text-white bg-pink-400 rounded-lg px-4 py-2 hover:bg-pink-300 mb-4"
      >
        Logout
      </button>

  
      {role === "Admin" && (
        <div className="mb-6">
          <input
            type="file"
            onChange={handleFileChange}
            className="p-2 border border-gray-300 rounded-lg mb-4"
          />
          <button
            onClick={handleFileUpload}
            className="text-white bg-blue-400 rounded-lg px-4 py-2 hover:bg-blue-300"
          >
            Upload File
          </button>

          {uploadStatus && (
            <div className="mt-4 text-lg font-semibold text-center text-gray-700">
              {uploadStatus}
            </div>
          )}

        </div>
      )}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2 text-gray-600">Available Files:</h2>
        {files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((fname, index) => (
              <li key={index} className="flex items-center justify-between w-96">
                <span>{fname}</span>
                <button
                  onClick={() => window.open(`http://localhost:3000/download?filename=${fname}`, '_blank')}
                  className="text-white bg-green-400 rounded-lg px-3 py-1 hover:bg-green-300"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}

export default HomePage;
