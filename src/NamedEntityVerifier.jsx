import { useState } from "react";
import pdfToText from "react-pdftotext";
import Tesseract from "tesseract.js";
import "./NamedEntityVerifier.css";

const NamedEntityVerifier = () => {
    const [formData, setFormData] = useState({
        name: "",
        fatherName: "",
        dob: "",
        aadhaarNumber: "",
    });
    const [file, setFile] = useState(null);
    const [docType, setDocType] = useState("aadhaar"); // Default doc type
    const [extractedText, setExtractedText] = useState("");
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        setFile(file);
    };

    const handleDocTypeChange = (event) => {
        setDocType(event.target.value); // Set selected document type
    };

    const extractTextFromFile = async (file) => {
        const fileType = file.type;

        if (fileType === "application/pdf") {
            const text = await pdfToText(file);
            return text;
        } else if (fileType.startsWith("image/")) {
            const { data: { text } } = await Tesseract.recognize(file, 'eng');
            return text;
        } else {
            throw new Error("Unsupported file type.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a valid file.");
            return;
        }

        try {
            const text = await extractTextFromFile(file);
            setExtractedText(text);

            const requestData = {
                formData,
                docType, // Send document type
                extractedText: text,
            };

            const response = await fetch("http://localhost:5000/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();
            if (response.ok) {
                alert(`Verification result: ${result.message}`);
            } else {
                alert(`Verification failed: ${result.message}`);
            }
        } catch (error) {
            setError("Error during text extraction or submission: " + error.message);
        }
    };

    return (
        <div className="container">
            <h2>Named Entity Verifier</h2>
            <form onSubmit={handleSubmit} className="verifier-form">
                <fieldset>
                    <label htmlFor="docType">Select Document Type</label>
                    <select id="docType" value={docType} onChange={handleDocTypeChange}>
                        <option value="aadhaar">Aadhaar</option>
                        <option value="pan">PAN Card</option>
                        <option value="marksheet">12th Marksheet</option>
                    </select>
                </fieldset>
                <fieldset>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                </fieldset>
                <fieldset>
                    <label htmlFor="fatherName">Father&apos;s Name</label>
                    <input
                        type="text"
                        id="fatherName"
                        name="fatherName"
                        placeholder="Enter your father's name"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                    />
                </fieldset>
                <fieldset>
                    <label htmlFor="dob">Date of Birth</label>
                    <input
                        type="date"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                    />
                </fieldset>
                <fieldset>
                    <label htmlFor="aadhaarNumber">Aadhaar Number</label>
                    <input
                        type="text"
                        id="aadhaarNumber"
                        name="aadhaarNumber"
                        placeholder="Enter Aadhaar number"
                        value={formData.aadhaarNumber}
                        onChange={handleInputChange}
                    />
                </fieldset>
                <fieldset>
                    <label htmlFor="file">Upload Aadhaar PDF/Image</label>
                    <input
                        type="file"
                        id="file"
                        accept="application/pdf, image/*"
                        onChange={handleFileInput}
                    />
                </fieldset>
                <button type="submit" className="submit-btn">Submit for Verification</button>
            </form>

            {error && <p className="error-message">{error}</p>}
            {extractedText && (
                <div className="text-output">
                    <h3>Extracted Text:</h3>
                    <pre>{extractedText}</pre>
                </div>
            )}
        </div>
    );
};

export default NamedEntityVerifier;
