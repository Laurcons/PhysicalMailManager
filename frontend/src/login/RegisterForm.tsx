import { AxiosError } from 'axios';
import React, { FormEvent, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import API from '../api';

export default function RegisterForm(props: {
	onPageSwitch: () => void
}) {
	let [username, setUsername] = useState("");
	let [password, setPassword] = useState("");
	let [confirmPassword, setConfirmPassword] = useState("");
	let [error, setError] = useState<string | null>(null);
	let [success, setSuccess] = useState<string | null>(null);
	let [isLoading, setIsLoading] = useState(false);
	return (
		<form onSubmit={tryRegister} style={{maxWidth: "480px"}}>
			<h2>Înregistrare</h2>
			<div className="form-group">
				<label>Nume utilizator:</label>
				<input className="form-control" type="text" onChange={(ev) => { setUsername(ev.target.value) }} />
			</div>
			<div className="form-group">
				<label>Parola:</label>
				<input className="form-control" type="password" onChange={(ev) => { setPassword(ev.target.value) }} />
			</div>
			<div className="form-group">
				<label>Confirmă parola:</label>
				<input className="form-control" type="password" onChange={(ev) => { setConfirmPassword(ev.target.value) }} />
			</div>
			{ error &&
				<div className="alert alert-danger">{error}</div>
			}
			{ success &&
				<div className="alert alert-success">{success}</div>
			}
			<button className="btn btn-primary" type="submit">
				Înregistrare
				{isLoading && <Spinner animation="border" size="sm" variant="secondary" className="ml-2" />}
			</button>
			<button className="btn btn-secondary" onClick={props.onPageSwitch}>
				Autentificare
			</button>
		</form>
	);

	function tryRegister(e: FormEvent) {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError("Parolele nu coincid!");
			return;
		}
		if (password.trim().length === 0 || username.trim().length === 0) {
			setError("Ați lăsat unul dintre câmpuri liber!");
			return;
		}

		// do register
		let formData = new FormData();
		formData.append("username", username);
		formData.append("password", password);
		setIsLoading(true);
		API.post("/register", formData).then((response) => {
			// all's ok!
			// props.onPageSwitch();
			setIsLoading(false);
			setError(null);
			setSuccess("Te-ai înregistrat cu succes! Mergi spre autentificare.");
		}).catch((reason: AxiosError) => {
			let status = reason.response?.data.status;
			if (status === "username-not-unique") {
				setError("Numele de utilizator există deja! Alegeți altul.");
			} else {
				setError("A avut loc o eroare necunoscută.");
			}
		});
	}
}