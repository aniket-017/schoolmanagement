import React, { useState } from "react";
import PersonalInfo from "./PersonalInfo";
import ContactInfo from "./ContactInfo";
import ParentInfo from "./ParentInfo";
import AcademicInfo from "./AcademicInfo";
import HealthInfo from "./HealthInfo";
import FeesInfo from "./FeesInfo";
import TransportSystemInfo from "./TransportSystemInfo";
import DocumentsInfo from "./DocumentsInfo";

const initialForm = {
  // Personal Information
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  religion: "",
  caste: "",
  motherTongue: "",
  bloodGroup: "",
  photo: "",

  // Contact & Address
  currentAddress: "",
  permanentAddress: "",
  city: "",
  state: "",
  pinCode: "",
  mobileNumber: "",
  email: "",

  // Parent/Guardian Information
  fatherName: "",
  fatherOccupation: "",
  fatherPhone: "",
  fatherEmail: "",
  fatherIncome: "",
  motherName: "",
  motherOccupation: "",
  motherPhone: "",
  motherEmail: "",
  motherIncome: "",
  guardianName: "",
  guardianRelation: "",
  guardianPhone: "",
  guardianEmail: "",

  // Academic Information
  rollNumber: "",
  registrationNumber: "",
  category: "",
  admissionDate: "",
  admissionNumber: "",
  section: "",
  academicYear: "",
  previousSchool: "",
  previousGrade: "",
  transferCertificateNumber: "",
  specialNeeds: "",
  learningDisabilities: "",
  academicAchievements: "",

  // Fees & Finance
  feeStructure: "",
  feeDiscount: "",
  paymentStatus: "pending",
  lateFees: "",
  scholarshipDetails: "",
  paymentHistoryNotes: "",
  paymentDate: "",
  paymentMethod: "",
  transactionId: "",
  feesPaid: "",

  // Physical & Health Metrics
  height: "",
  weight: "",
  visionTestLeftEye: "",
  visionTestRightEye: "",
  visionTestDate: "",
  hearingTestLeftEar: "",
  hearingTestRightEar: "",
  hearingTestDate: "",
  fitnessScore: "",

  // Medical Information
  allergies: "",
  medicalConditions: "",
  medications: "",
  emergencyInstructions: "",
  vaccinationStatus: "complete",

  // Emergency Contact
  emergencyContactName: "",
  emergencyContactRelation: "",
  emergencyContactPhone: "",
  emergencyContactEmail: "",

  // System & Access Information
  rfidCardNumber: "",
  libraryCardNumber: "",
  portalUsername: "",
  portalPassword: "",
  hostelRoomNumber: "",
  hostelWardenName: "",
  hostelWardenPhone: "",

  // Transport Details
  transportRequired: false,
  pickupPoint: "",
  dropPoint: "",
  busNumber: "",
  driverName: "",
  driverPhone: "",

  // Documents
  birthCertificate: "",
  transferCertificate: "",
  characterCertificate: "",
  medicalCertificate: "",
  aadharCard: "",
  casteCertificate: "",
  incomeCertificate: "",
  passport: "",
  previousReportCard: "",
  disabilityCertificate: "",
  documentNotes: "",

  // Additional Notes
  specialInstructions: "",
};

const steps = [
  { title: "Personal Information", component: PersonalInfo },
  { title: "Contact & Address", component: ContactInfo },
  { title: "Parent/Guardian", component: ParentInfo },
  { title: "Academic Information", component: AcademicInfo },
  { title: "Health & Medical", component: HealthInfo },
  { title: "Fees & Finance", component: FeesInfo },
  { title: "Transport & System", component: TransportSystemInfo },
  { title: "Documents", component: DocumentsInfo },
];

export default function StudentMultiStepForm({ onSubmit, onCancel, isSubmitting: externalIsSubmitting }) {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (externalIsSubmitting === undefined) {
      setInternalIsSubmitting(true);
    }

    try {
      // Transform form data to match backend expectations
      const transformedData = {
        // Basic required fields
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
        gender: form.gender,
        email: form.email,
        mobileNumber: form.mobileNumber,
        optionalMobileNumber: form.optionalMobileNumber,
        rollNumber: form.rollNumber,
        currentAddress: form.currentAddress,

        // Personal Information
        nationality: form.nationality,
        religion: form.religion,
        caste: form.caste,
        motherTongue: form.motherTongue,
        bloodGroup: form.bloodGroup,
        photo: form.photo,

        // Contact & Address
        permanentAddress: form.permanentAddress,
        city: form.city,
        state: form.state,
        pinCode: form.pinCode,
        // Map parent fields to backend structure - use flat structure for required fields
        mothersName: form.motherName,

        father: form.fatherName
          ? {
              name: form.fatherName,
              occupation: form.fatherOccupation,
              phone: form.fatherPhone,
              email: form.fatherEmail,
              annualIncome: form.fatherIncome ? parseFloat(form.fatherIncome) : undefined,
            }
          : undefined,
        mother: {
          name: form.motherName,
          occupation: form.motherOccupation,
          phone: form.motherPhone,
          email: form.motherEmail,
          annualIncome: form.motherIncome ? parseFloat(form.motherIncome) : undefined,
        },
        guardian: form.guardianName
          ? {
              name: form.guardianName,
              relation: form.guardianRelation,
              phone: form.guardianPhone,
              email: form.guardianEmail,
            }
          : undefined,

        // Academic Information
        registrationNumber: form.registrationNumber,
        category: form.category,
        admissionDate: form.admissionDate ? new Date(form.admissionDate) : undefined,
        admissionNumber: form.admissionNumber,
        section: form.section,
        academicYear: form.academicYear,
        previousSchool: form.previousSchool,
        previousGrade: form.previousGrade,
        transferCertificateNumber: form.transferCertificateNumber,
        specialNeeds: form.specialNeeds,
        learningDisabilities: form.learningDisabilities
          ? [
              {
                type: "General",
                description: form.learningDisabilities,
              },
            ]
          : [],
        academicAchievements: form.academicAchievements ? [form.academicAchievements] : [],

        // Additional fields
        remarks: form.specialInstructions || form.documentNotes,
        notes: [form.specialInstructions, form.documentNotes, form.paymentHistoryNotes].filter(Boolean),

        // Remove any undefined values to avoid validation issues
        ...Object.fromEntries(
          Object.entries({
            // Fees & Finance (only include if fee structure is selected)
            ...(form.feeStructure && {
              feeStructure: form.feeStructure,
              feeSlabId: form.feeSlabId || undefined,
              feeDiscount: form.feeDiscount ? parseFloat(form.feeDiscount) : undefined,
              paymentStatus: form.paymentStatus,
              lateFees: form.lateFees ? parseFloat(form.lateFees) : undefined,
              concessionAmount: form.concessionAmount ? parseFloat(form.concessionAmount) : undefined,
              scholarshipDetails: form.scholarshipDetails || undefined,
              // Payment fields - only include if they have valid values
              ...(form.paymentDate && { paymentDate: new Date(form.paymentDate) }),
              ...(form.paymentMethod && form.paymentMethod.trim() && { paymentMethod: form.paymentMethod }),
              ...(form.transactionId && form.transactionId.trim() && { transactionId: form.transactionId }),
              ...(form.feesPaid && form.feesPaid > 0 && { feesPaid: parseFloat(form.feesPaid) }),
            }),
            scholarships: form.scholarshipDetails
              ? [
                  {
                    name: "General Scholarship",
                    amount: 0,
                    year: new Date().getFullYear().toString(),
                    description: form.scholarshipDetails,
                  },
                ]
              : [],

            // Physical & Health Metrics
            physicalMetrics:
              form.height || form.weight || form.fitnessScore
                ? {
                    height: form.height ? parseFloat(form.height) : undefined,
                    weight: form.weight ? parseFloat(form.weight) : undefined,
                    visionTest: form.visionTestLeftEye
                      ? {
                          leftEye: form.visionTestLeftEye,
                          rightEye: form.visionTestRightEye,
                          date: form.visionTestDate ? new Date(form.visionTestDate) : undefined,
                        }
                      : undefined,
                    hearingTest: form.hearingTestLeftEar
                      ? {
                          leftEar: form.hearingTestLeftEar,
                          rightEar: form.hearingTestRightEar,
                          date: form.hearingTestDate ? new Date(form.hearingTestDate) : undefined,
                        }
                      : undefined,
                    fitnessScore: form.fitnessScore ? parseFloat(form.fitnessScore) : undefined,
                  }
                : undefined,

            // Medical Information
            medicalHistory:
              form.allergies || form.medicalConditions || form.medications || form.emergencyInstructions
                ? {
                    allergies: form.allergies ? form.allergies.split(",").map((a) => a.trim()) : [],
                    medicalConditions: form.medicalConditions
                      ? form.medicalConditions.split(",").map((c) => c.trim())
                      : [],
                    medications: form.medications ? form.medications.split(",").map((m) => m.trim()) : [],
                    emergencyInstructions: form.emergencyInstructions,
                    vaccinationStatus: form.vaccinationStatus,
                  }
                : undefined,

            // Emergency Contact
            emergencyContact: form.emergencyContactName
              ? {
                  name: form.emergencyContactName,
                  relation: form.emergencyContactRelation,
                  phone: form.emergencyContactPhone,
                  email: form.emergencyContactEmail,
                }
              : undefined,

            // Hostel Information
            hostelInformation: form.hostelRoomNumber
              ? {
                  roomNumber: form.hostelRoomNumber,
                  wardenName: form.hostelWardenName,
                  wardenPhone: form.hostelWardenPhone,
                }
              : undefined,

            // Transport Details
            transportDetails: {
              required: form.transportRequired,
              pickupPoint: form.pickupPoint,
              dropPoint: form.dropPoint,
              busNumber: form.busNumber,
              driverName: form.driverName,
              driverPhone: form.driverPhone,
            },

            // Documents
            documents: {
              birthCertificate: form.birthCertificate,
              transferCertificate: form.transferCertificate,
              characterCertificate: form.characterCertificate,
              medicalCertificate: form.medicalCertificate,
              photograph: form.photo,
              aadharCard: form.aadharCard,
              casteCertificate: form.casteCertificate,
              incomeCertificate: form.incomeCertificate,
              passport: form.passport,
            },

            // System & Access Information
            rfidCardNumber: form.rfidCardNumber,
            libraryCardNumber: form.libraryCardNumber,
            loginCredentials:
              form.portalUsername || form.portalPassword
                ? {
                    username: form.portalUsername,
                    password: form.portalPassword,
                  }
                : undefined,
          }).filter(([key, value]) => value !== undefined && value !== null && value !== "")
        ),
      };

      if (onSubmit) {
        await onSubmit(transformedData);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      if (externalIsSubmitting === undefined) {
        setInternalIsSubmitting(false);
      }
    }
  };

  const CurrentStepComponent = steps[step]?.component;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex gap-2">
          {steps.map((stepItem, idx) => (
            <div key={idx} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx <= step ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
              <p className={`text-xs mt-1 text-center ${idx <= step ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                {stepItem.title}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-2">
          <span className="text-sm text-gray-600">
            Step {step + 1} of {steps.length}
          </span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit}>
          {CurrentStepComponent && <CurrentStepComponent form={form} handleChange={handleChange} />}

          {/* Navigation Buttons */}
          <div className="flex justify-between p-6 border-t bg-gray-50">
            <div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  ← Previous
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              )}

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
