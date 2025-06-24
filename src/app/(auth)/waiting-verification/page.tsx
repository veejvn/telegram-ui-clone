"use client";

import { useRegistrationStore } from "@/stores/useRegistrationStore";

const WaitingVerificationPage = () => {
    const { registrationData } = useRegistrationStore();
    console.log("Registration Data:", registrationData);
    return ( 
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">Waiting for Verification</h1>
                <p className="text-gray-700 mb-4">Please check your email for a verification link. If you don't see it, check your spam folder.</p>
                <p className="text-gray-500 text-sm">If you haven't received an email, you can request a new one.</p>
            </div>
        </div>
     );
}
 
export default WaitingVerificationPage;