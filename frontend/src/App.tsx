import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import API from './api';
import { UserData } from './apiTypes';
import LoginForm from './login/LoginForm';
import RegisterForm from './login/RegisterForm';
import Panel from './Panel';

function App() {
	let [currentUser, setCurrentUser] = useState<UserData | null>(null);
	let [isInitializing, setIsInitializing] = useState(true);
	let [error, setError] = useState<string | null>(null);
	let [currentPage, setCurrentPage] = useState<"login" | "register">("login");
	let [darkMode, setDarkMode] = useState(() => {
		let hourNow = new Date().getHours();
		return !(hourNow >= 7 && hourNow <= 18);
	});
	useEffect(() => {
		// this will most probably fail, but if it doesn't, it means
		//  the user is logged in (session cookie is still valid) so
		//  go ahead and automatically log them in
		API.get("/user").then((response) => {
			setCurrentUser(response.data.data);
			setIsInitializing(false);
		}).catch((reason: AxiosError) => {
			let data = reason.response?.data;
			if (data && (data.status !== "access-denied" || data.reason !== "not-logged-in")) {
				setError("Nu se poate comunica cu serverul, acesta a returnat o eroare.");
			} else setIsInitializing(false);
		});
	}, []);

	useEffect(() => {
		styleModeSwitch();
		function styleModeSwitch() {
			let elem = document.getElementById("stylesheetLink");
			if (!elem) {
				alert("Nu s-a găsit elementul <link> necesar. Nu se poate continua.");
				return;
			}
			let prefix = elem.getAttribute("data-prefix") ?? "";
			if (!darkMode) {
				// switch to light mode
				elem.setAttribute("href", prefix + "/style/bootstrap.united.min.css");
			} else {
				// switch to dark mode
				elem.setAttribute("href", prefix + "/style/bootstrap.superhero.min.css");
			}
		}
	}, [darkMode]);


	return (
		<BrowserRouter>
			<div className="container py-3 px-md-0 px-1">
				<div className="clearfix mb-2 mx-2 mx-md-0">
					<h1 className="d-inline">Manager Poștă Fizică</h1>
					<button className="btn btn-outline-primary float-right btn-sm" onClick={() => setDarkMode(!darkMode)}>
						{darkMode && "Mod întunecat"}
						{!darkMode && "Mod luminos"}
					</button>
				</div>
				<div className="d-md-none alert alert-warning">
					Folosiți un dispozitiv mobil. Această aplicație web nu este (încă) optimizată pentru o experiență mobilă,
					dar puteți continua.
				</div>
				{ error && <div className="alert alert-danger">{error}</div>}

				{isInitializing && <span className="spinner-border" />}

				{!currentUser &&
				!isInitializing &&
				currentPage === "login" &&
					<LoginForm
						onLogin={(user) => {
							setCurrentUser(user);
						}}
						onPageSwitch={() => { setCurrentPage("register") }}
					/>
				}

				{!currentUser && !isInitializing && currentPage === "register" && <RegisterForm onPageSwitch={() => { setCurrentPage("login") }} />}

				{currentUser && !isInitializing &&
					<Panel
						user={currentUser}
						onLogout={(reason) => {
							setCurrentUser(null);
						}}
					/>
				}
			</div>
		</BrowserRouter>
	);
}


export default App;
