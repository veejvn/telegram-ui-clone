import { NextResponse } from 'next/server';

// Matrix homeserver Client-Server API URL
const HOMESERVER_URL = "https://matrix-client.matrix.org";

// Identity server hostname/IP - used in the request body for some endpoints
// For matrix.org accounts, the identity server is usually 'matrix.org'
const ID_SERVER_HOSTNAME = "matrix.org";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email address is required' },
                { status: 400 }
            );
        }

        console.log("Attempting to send password reset request for email:", email);

        // Calling the Client-Server API endpoint for requesting email token
        // Endpoint: POST /_matrix/client/r0/account/password/email/requestToken
        const response = await fetch(`${HOMESERVER_URL}/_matrix/client/r0/account/password/email/requestToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                client_secret: Math.random().toString(36).substring(2),
                send_attempt: 1,
                next_link: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
                id_server: ID_SERVER_HOSTNAME
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Log full error response from Homeserver
            console.error("Full error response from Homeserver:", data);

            // Extract error info from Homeserver response
            const homeserverErrorCode = data.errcode || 'UNKNOWN_HOMESERVER_ERROR';
            const homeserverErrorMessage = data.error || data.message || 'Failed to send reset password email';

            // Determine status code based on Homeserver response status
            const statusCode = (response.status >= 400 && response.status < 500) ? response.status : 500;

            // For M_UNRECOGNIZED, it's likely a client-side issue (wrong endpoint/params)
            // Return 400 or 404 in this case for clarity
            const finalStatusCode = (homeserverErrorCode === 'M_UNRECOGNIZED' || response.status === 404) ? 404 : statusCode;


            return NextResponse.json(
                {
                    error: 'Failed to send reset password email',
                    details: {
                        homeserver_code: homeserverErrorCode,
                        homeserver_message: homeserverErrorMessage,
                        http_status: response.status
                    }
                },
                { status: finalStatusCode }
            );
        }

        console.log("Password reset request successful from Homeserver. Response:", data);

        // Successful response should include sid
        return NextResponse.json(
            { message: data.sid ? 'Password reset email request successful' : 'Unknown success response from Homeserver', sid: data.sid },
            { status: response.status }
        );

    } catch (error: any) {
        // Log error occurring within the API route (e.g., network error, JSON parsing error)})
        console.error('Forgot password API route internal error:', error);

        // Return a general 500 error for internal issues
        return NextResponse.json(
            { error: error.message || 'An unexpected internal server error occurred' },
            { status: 500 }
        );
    }
} 