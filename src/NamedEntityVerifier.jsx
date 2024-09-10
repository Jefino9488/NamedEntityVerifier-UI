import { useState } from "react";
import pdfToText from "react-pdftotext";
import "./NamedEntityVerifier.css"; // Importing external CSS

const NamedEntityVerifier = () => {
    const [formData, setFormData] = useState({
        name: "",
        fatherName: "",
        dob: "",
        aadhaarNumber: "",
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfText, setPdfText] = useState("");
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        setPdfFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!pdfFile) {
            setError("Please select a valid PDF file.");
            return;
        }

        try {
            const text = await pdfToText(pdfFile);
            setPdfText(text);

            const requestData = {
                formData,
                pdfText: text,
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
            setError("Error during PDF text extraction or submission: " + error.message);
        }
    };

    return (
        <div className="container">
            <h2>Named Entity Verifier</h2>
            <form onSubmit={handleSubmit} className="verifier-form">
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
                    <label htmlFor="fatherName">Father's Name</label>
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
                    <label htmlFor="pdfFile">Upload Aadhaar PDF</label>
                    <input
                        type="file"
                        id="pdfFile"
                        accept="application/pdf"
                        onChange={handleFileInput}
                    />
                </fieldset>
                <button type="submit" className="submit-btn">Submit for Verification</button>
            </form>

            {error && <p className="error-message">{error}</p>}
            {pdfText && (
                <div className="pdf-output">
                    <h3>Extracted PDF Text:</h3>
                    <pre>{pdfText}</pre>
                </div>
            )}
        </div>
    );
};

export default NamedEntityVerifier;
