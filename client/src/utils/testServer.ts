// Utility function to test if the server is running
export async function testServerConnection(): Promise<boolean> {
    try {
        const response = await fetch('/api/health', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            console.log('Server is running and accessible');
            return true;
        } else {
            console.log('Server responded with status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Server connection test failed:', error);
        return false;
    }
}

// Test the anonymous endpoint specifically
export async function testAnonymousEndpoint(): Promise<boolean> {
    try {
        const testData = {
            handle: 'TestUser' + Date.now(),
            cookieId: 'test_cookie_' + Date.now(),
        };

        const response = await fetch('/api/auth/anonymous', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(testData),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Anonymous endpoint test successful:', data);
            return true;
        } else {
            const errorText = await response.text();
            console.error('Anonymous endpoint test failed:', response.status, errorText);
            return false;
        }
    } catch (error) {
        console.error('Anonymous endpoint test error:', error);
        return false;
    }
}
