import { useState } from "react";
import { db } from "./firebase"; // আপনার firebase.js ফাইলের পাথ ঠিক করে দেবেন
import { collection, addDoc } from "firebase/firestore";

export default function AdminUpload() {
  const [country, setCountry] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Cloudinary credentials
  const CLOUD_NAME = "ddziennkh"; //[cite: 12]
  const UPLOAD_PRESET = "eduaimers_pdf_preset"; //[cite: 13]

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !country) {
      alert("Please enter a country name and select a PDF file!");
      return;
    }

    setUploading(true);

    try {
      // 1. Cloudinary-তে PDF আপলোড করার জন্য FormData তৈরি
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      // 2. Cloudinary API-তে POST রিকোয়েস্ট পাঠানো
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.secure_url) {
        throw new Error("Cloudinary upload failed!");
      }

      const pdfUrl = data.secure_url;

      // 3. Firestore Database-এ দেশের নাম ও PDF এর সিকিউর লিংক সেভ করা
      await addDoc(collection(db, "trainingDocuments"), {
        country: country.trim().toLowerCase(), // সার্চ ও ফিল্টারের সুবিধার জন্য
        displayCountry: country.trim(),
        title: file.name,
        fileUrl: pdfUrl,
        createdAt: new Date(),
      });

      alert("PDF Uploaded and Published Successfully!");
      setCountry("");
      setFile(null);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload PDF. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-[#0A192F]">
        Admin: Upload Training PDF
      </h2>

      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Country Name:</label>
          <input
            type="text"
            placeholder="e.g. South Korea, Spain"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0A192F]"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Select PDF File:</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-[#0A192F] text-white py-2 rounded font-semibold hover:bg-blue-900 transition-all"
        >
          {uploading ? "Uploading PDF..." : "Upload & Publish PDF"}
        </button>
      </form>
    </div>
  );
}