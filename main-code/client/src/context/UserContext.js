// import { createContext, useState, useContext } from 'react';
// import PropTypes from 'prop-types';

// const UserContext = createContext();

// export const useUser = () => {
//     return useContext(UserContext);
// };

// UserProvider.propTypes = {
//     children: PropTypes.node.isRequired,
// };

// export const UserProvider = ({ children }) => {
//     const [user, setUser] = useState(null);

//     const loginUser = (userData) => {
//         setUser(userData); // Store user data (name and email)
//     };

//     const logoutUser = () => {
//         setUser(null); // Clear user data
//     };

//     return (
//         <UserContext.Provider value={{ user, loginUser, logoutUser }}>
//             {children}
//         </UserContext.Provider>
//     );
// };
