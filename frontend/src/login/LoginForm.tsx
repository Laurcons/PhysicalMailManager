import { AxiosError } from "axios";
import React, { FormEvent } from "react";
import { useState } from "react";
import API from "../api";
import { UserData } from "../apiTypes";

export default function LoginForm(props: {
	onLogin: (user: UserData) => void,
	onPageSwitch: () => void
}) {
	let [username, setUsername] = useState("");
	let [password, setPassword] = useState("");
	let [isLoading, setIsLoading] = useState(false);
	let [error, setError] = useState<string | null>(null);

	const tryAuth = (e: FormEvent) => {
		e.preventDefault();

		let formData = new FormData();
		formData.append("username", username);
		formData.append("password", password);
		setIsLoading(true);
		setError(null);
		API.post("/login", formData).then(() => {
			return API.get("/user").then((response) => {
				props.onLogin(response.data.data);
			});
		}).catch((reason: AxiosError) => {
			switch (reason.response?.data.status) {
				case "user-not-found":
					setError("Utilizatorul nu a fost găsit!"); break;
				case "password-invalid":
					setError("Parola dvs. este incorectă!"); break;
				default:
					setError("A avut loc o eroare necunoscută: " + reason.response?.data.status);
			}
		}).finally(() => {
			setIsLoading(false);
		});
	}

	return (
		<form onSubmit={tryAuth} style={{maxWidth: "480px"}}>
			<h2>Autentificare</h2>
			<div className="form-group">
				<label>Nume utilizator:</label>
				<input className="form-control" type="text" onChange={(ev) => { setUsername(ev.target.value) }} />
			</div>
			<div className="form-group">
				<label>Parola:</label>
				<input className="form-control" type="password" onChange={(ev) => { setPassword(ev.target.value) }} />
			</div>
			{ error &&
				<div className="alert alert-danger">{error}</div>
			}
			<button className="btn btn-primary" type="submit">
				Autentificare
				{isLoading && <span className="spinner-border-sm spinner-border ml-2" />}
			</button>
			<button className="btn btn-secondary" onClick={props.onPageSwitch}>
				Înregistrare
			</button>
		</form>
	)
}