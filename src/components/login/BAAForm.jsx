import React, { useState, useEffect } from 'react';
import logo from '../../assets/images/logo.png';
import BAAAgreementText from './BAAAgreementText';
import { toast } from 'react-hot-toast';

// Helper function to capitalize text (Title Case)
const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const BAAForm = ({ onAgreementAccepted, userData }) => {
  const [formData, setFormData] = useState({
    effectiveDate: '',
    providerCompanyName: '',
    monthlyVolume: 0,
    signatoryName: '',
    signatoryTitle: '',
    signature: '',
    // signatureDate: '',
  });

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Initialize form data once on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    setFormData({
      effectiveDate: today,
      // signatureDate: today,
      providerCompanyName: toTitleCase(userData?.facility) || '',
      signatoryName: toTitleCase(userData?.full_name) || '',
      signatoryTitle: 'Dr.',
      monthlyVolume: 0,
      signature: '',
    });
  }, [userData]); // ✅ Empty array - only runs once

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   if (!agreed) {
  //     toast.error("Please check the agreement box to accept the terms and proceed.");
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   const requiredFields = [
  //     'monthlyVolume', 'providerCompanyName', 'effectiveDate',
  //     'signatoryName', 'signatoryTitle', 'signature', 'signatureDate'
  //   ];

  //   const isFormValid = requiredFields.every(field => 
  //     formData[field] && String(formData[field]).trim() !== ''
  //   );

  //   if (!isFormValid) {
  //     toast.error("Please fill in all mandatory fields before agreeing.");
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   console.log("Submitting BAA Agreement:", formData);

  //   onAgreementAccepted(formData)
  //     .finally(() => setIsSubmitting(false));
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!agreed) {
      toast.error("Please check the agreement box to accept the terms and proceed.");
      setIsSubmitting(false);
      return;
    }

    const requiredFields = [
       'providerCompanyName', 'effectiveDate',
      'signatoryName', 'signatoryTitle', 'signature'
    ];

    const isFormValid = requiredFields.every(field => 
      formData[field] && String(formData[field]).trim() !== ''
    );

    if (!isFormValid) {
      toast.error("Please fill in all mandatory fields before agreeing.");
      setIsSubmitting(false);
      return;
    }

    console.log("Submitting BAA Agreement:", formData);

    // ✅ Convert camelCase to snake_case for backend
    const backendFormData = {
      monthly_volume: 0,
      provider_company_name: formData.providerCompanyName,
      effective_date: formData.effectiveDate,
      signatory_name: formData.signatoryName,
      signatory_title: formData.signatoryTitle,
      signature: formData.signature,
      signature_date: formData.effectiveDate,
    };

    onAgreementAccepted(backendFormData)
      .finally(() => setIsSubmitting(false));
};



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-8 space-y-6">

          {/* Header */}
          <div className='flex justify-center items-center'>
            <img src={logo} alt="ProMed Logo" style={{ height: 70, width: 70 }} />
            <h1 className="text-3xl font-extrabold text-teal-700 border-b pb-2 text-center ml-4">
              ProMed Health Plus, LLC
            </h1>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Business Associate and Purchase Agreement Acceptance
          </h2>

          <p className="text-sm text-gray-600 font-medium text-center">
            To access the service, please accept this agreement.
          </p>

          <BAAAgreementText formData={formData} />

          <form onSubmit={handleSubmit} className="mt-8 space-y-3 p-4 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 text-center">Agreement Execution</h3>

            {/* Monthly Volume */}
            {/* <div className="flex flex-col md:flex-row md:items-center py-2">
              <label htmlFor="monthlyVolume" className="w-full md:w-1/3 text-sm font-medium text-gray-700">
                Anticipated Average Monthly Volume
              </label>
              <div className="w-full md:w-2/3">
                <input
                  id="monthlyVolume"
                  name="monthlyVolume"
                  type="number"
                  value={formData.monthlyVolume}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-b border-gray-300 py-1 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
                />
              </div>
            </div> */}

            {/* Provider Company Name */}
            <div className="flex flex-col md:flex-row md:items-center py-2">
              <label htmlFor="providerCompanyName" className="w-full md:w-1/3 text-sm font-medium text-gray-700">
                Provider Company Name
              </label>
              <div className="w-full md:w-2/3">
                <input
                  id="providerCompanyName"
                  name="providerCompanyName"
                  type="text"
                  value={formData.providerCompanyName}
                  onChange={handleChange}
                  readOnly
                  required
                  className="mt-1 block w-full border-b border-gray-300 py-1 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
               />
              </div>
            </div>

            {/* Effective Date (Read-only) */}
            <div className="flex flex-col md:flex-row md:items-center py-2">
              <label htmlFor="effectiveDate" className="w-full md:w-1/3 text-sm font-medium text-gray-700">
                Effective Date
              </label>
              <div className="w-full md:w-2/3">
                <input
                  id="effectiveDate"
                  name="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                  readOnly
                  required
                  className="mt-1 block w-full border-b border-gray-300 py-1 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Signatory Name */}
            <div className="flex flex-col md:flex-row md:items-center py-2">
              <label htmlFor="signatoryName" className="w-full md:w-1/3 text-sm font-medium text-gray-700">
                Authorized Signatory Name
              </label>
              <div className="w-full md:w-2/3">
                <input
                  id="signatoryName"
                  name="signatoryName"
                  type="text"
                  value={formData.signatoryName}
                  onChange={handleChange}
                  readOnly
                  required
                  className="mt-1 block w-full border-b border-gray-300 py-1 sm:text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Signatory Title */}
            <div className="flex flex-col md:flex-row md:items-center py-2">
              <label htmlFor="signatoryTitle" className="w-full md:w-1/3 text-sm font-medium text-gray-700">
                Authorized Signatory Title
              </label>
              <div className="w-full md:w-2/3">
                <input
                  id="signatoryTitle"
                  name="signatoryTitle"
                  type="text"
                  value={formData.signatoryTitle}
                  onChange={handleChange}
                  readOnly
                  required
                  className="mt-1 block w-full border-b border-gray-300 py-1 sm:text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Signature */}
            <div className="flex flex-col md:flex-row md:items-center py-2">
              <label htmlFor="signature" className="w-full md:w-1/3 text-sm font-medium text-gray-700">
                Authorized Signatory Signature (Type Full Name)
              </label>
              <div className="w-full md:w-2/3">
                <input
                  id="signature"
                  name="signature"
                  type="text"
                  value={formData.signature}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-b border-gray-300 py-1 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
                />
              </div>
            </div>

            {/* Signature Date (Read-only) */}
            {/* <div className="flex flex-col md:flex-row md:items-center py-2">
              <label htmlFor="signatureDate" className="w-full md:w-1/3 text-sm font-medium text-gray-700">
                Signature Date
              </label>
              <div className="w-full md:w-2/3">
                <input
                  id="signatureDate"
                  name="signatureDate"
                  type="date"
                  value={formData.signatureDate}
                  onChange={handleChange}
                  readOnly
                  required
                  className="mt-1 block w-full border-b border-gray-300 py-1 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div> */}

            {/* Agreement Checkbox */}
            <div className="flex items-start pt-6 border-t border-gray-200 mt-6">
              <div className="flex items-center h-5">
                <input
                  id="agreement_checkbox"
                  name="agreement_checkbox"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreement_checkbox" className="font-medium text-gray-700">
                  I agree to the <strong>ProMed Health Plus Business Associate Agreement</strong> and <strong>Purchase Agreement</strong> terms.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !agreed}
              className={`
                w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                text-sm font-medium text-white 
                ${agreed && !isSubmitting
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  : 'bg-indigo-400 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? 'Submitting Agreement...' : 'Accept and Continue to Verification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BAAForm;