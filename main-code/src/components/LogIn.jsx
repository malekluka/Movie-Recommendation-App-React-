import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate(); // Corrected typo
    const [Inputvalue, setInputvalue] = useState({
        email: '',
        password: ''
    });

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg border border-2 shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    console.log(Inputvalue);
                    // Sending email and password directly, not wrapped in an 'Inputvalue' object
                    axios.post('http://localhost:3001/login', {
                        email: Inputvalue.email,
                        password: Inputvalue.password
                    })
                        .then(result => {
                            if (result.data.msg === "success") {
                                // Save user data in local storage
                                localStorage.setItem('username', result.data.name); // Assuming the response contains the user's name
                                console.log(result.data)
                                navigate('/');
                            } else {
                                alert('Please enter correct Email and Password');
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            alert('Could not find an account with such credentials. Do you have an account already?');
                        });
                }} className="space-y-4">

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" id="email" name="email" required
                            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            onChange={(e) => {
                                setInputvalue({ ...Inputvalue, email: e.target.value });
                            }} />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" id="password" name="password" required
                            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            onChange={(e) => {
                                setInputvalue({ ...Inputvalue, password: e.target.value });
                            }} />
                    </div>

                    <div className="flex items-center justify-between">
                        <label htmlFor="remember-me" className="flex items-center">
                            <input type="checkbox" id="remember-me" name="remember-me"
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <span className="ml-2 block text-sm text-gray-700">Remember me</span>
                        </label>
                        <Link to="#" className="text-sm text-indigo-600 hover:text-indigo-500">Forgot your password?</Link>
                    </div>

                    <div>
                        <button type="submit"
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium">
                            Log In
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-600">Don't have an account?
                        <Link to="/signup" className="text-indigo-600 hover:text-indigo-500"> Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
