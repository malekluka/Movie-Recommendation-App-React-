import axios from 'axios';
import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App'; // Import UserContext
import { faMessage } from '@fortawesome/free-regular-svg-icons'; // Import the regular message icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon component

function Login() {
    const { setUser } = useContext(UserContext); // Access setUser from context
    const navigate = useNavigate();
    const [Inputvalue, setInputvalue] = useState({
        email: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false); // State for "Remember Me"
    const [suggestedEmail, setSuggestedEmail] = useState(''); // State for suggested email
    const [suggestedPassword, setSuggestedPassword] = useState(''); // State for suggested password
    const [showSuggestions, setShowSuggestions] = useState(false); // State to toggle pop-up
    const emailInputRef = useRef(null); // Ref for email input field

    // Check if user data exists in localStorage on component mount
    useEffect(() => {
        const storedEmail = localStorage.getItem('rememberedEmail');
        const storedPassword = localStorage.getItem('rememberedPassword');
        if (storedEmail && storedPassword) {
            setSuggestedEmail(storedEmail);
            setSuggestedPassword(storedPassword);
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg border shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    axios.post('http://localhost:3001/login', {
                        email: Inputvalue.email,
                        password: Inputvalue.password
                    })
                        .then(result => {
                            if (result.data.msg === "success") {
                                localStorage.setItem('username', result.data.name); // Save username in localStorage
                                setUser({ name: result.data.name }); // Update user context dynamically
                                if (rememberMe) {
                                    // Save email and password if "Remember Me" is checked
                                    localStorage.setItem('rememberedEmail', Inputvalue.email);
                                    localStorage.setItem('rememberedPassword', Inputvalue.password);
                                } else {
                                    // Clear remembered email and password if "Remember Me" is unchecked
                                    localStorage.removeItem('rememberedEmail');
                                    localStorage.removeItem('rememberedPassword');
                                }
                                navigate('/'); // Redirect to homepage
                            } else {
                                alert('Please enter correct Email and Password');
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            alert('Could not find an account with such credentials. Do you have an account already?');
                        });
                }} className="space-y-4">

                    <div className="relative">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            ref={emailInputRef} // Attach ref to email input
                            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            value={Inputvalue.email}
                            onChange={(e) => {
                                setInputvalue({ ...Inputvalue, email: e.target.value });
                            }}
                            onFocus={() => {
                                if (suggestedEmail) setShowSuggestions(true); // Show pop-up on focus if suggestions exist
                            }}
                            onBlur={() => {
                                setTimeout(() => setShowSuggestions(false), 200); // Delay hiding to allow button clicks
                            }}
                        />
                        {showSuggestions && suggestedEmail && (
                            <div
                                className="absolute bg-gray-100 border border-gray-300 shadow-lg p-4 rounded-lg z-10"
                                style={{
                                    bottom: emailInputRef.current?.offsetHeight + 10 || 0, // Position above the email input
                                    left: '75%', // Center horizontally
                                    transform: 'translateX(-50%)', // Center relative to the input
                                    width: '90%', // Slightly smaller width
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Softer shadow
                                }}
                            >
                                <h4 className="text-sm font-bold mb-2 text-indigo-600 text-center">Remember Me</h4>
                                <p className="text-sm text-gray-700"><strong>Email:</strong> {suggestedEmail}</p>
                                <p className="text-sm text-gray-700"><strong>Password:</strong> ••••••••</p>
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        className="text-sm text-indigo-600 hover:text-indigo-500 mr-2"
                                        onClick={() => {
                                            setInputvalue({ email: suggestedEmail, password: suggestedPassword });
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        Use
                                    </button>
                                    <button
                                        type="button"
                                        className="text-sm text-gray-600 hover:text-gray-800"
                                        onClick={() => setShowSuggestions(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            value={Inputvalue.password}
                            onChange={(e) => {
                                setInputvalue({ ...Inputvalue, password: e.target.value });
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label htmlFor="remember-me" className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember-me"
                                name="remember-me"
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span className="ml-2 block text-sm text-gray-700">Remember me</span>
                        </label>
                        <Link to="#" className="text-sm text-indigo-600 hover:text-indigo-500">Forgot your password?</Link>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium"
                        >
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
