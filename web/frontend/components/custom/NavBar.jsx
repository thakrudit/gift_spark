import React from 'react'
import { NavLink, useLocation } from 'react-router-dom';

export function NavBar() {
    const location = useLocation();
    const isActiveRoute = location.pathname === '/setGoals' || location.pathname === '/freeGiftGoal';

    return (
        <div className="bg-gray-200 p-2 mb-2 rounded">
            <ul className="flex gap-2 space-y-1">
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `rounded block px-3 py-2 text-sm ${isActive
                                ? "text-teal-600 border-l-2 border-teal-600 bg-white"
                                : "text-gray-700"
                            }`
                        }
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/freeGift"
                        className={({ isActive }) =>
                            `rounded block px-3 py-2 text-sm ${isActive
                                ? "text-teal-600 border-l-2 border-teal-600 bg-white"
                                : "text-gray-700"
                            }`
                        }
                    >
                        Free Gifts
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/setGoals"
                        className={({ isActive }) =>
                            `rounded block px-3 py-2 text-sm ${isActiveRoute
                                ? "text-teal-600 border-l-2 border-teal-600 bg-white"
                                : "text-gray-700"
                            }`
                        }
                    >
                        Set Goals
                    </NavLink>
                </li>
                {/* <li>
                    <NavLink
                        to="/setting"
                        className={({ isActive }) =>
                            `rounded block px-3 py-2 text-sm ${isActive
                                ? "text-teal-600 border-l-2 border-teal-600 bg-white"
                                : "text-gray-700"
                            }`
                        }
                    >
                        Setting
                    </NavLink>
                </li> */}
            </ul>
        </div>
    )
}
