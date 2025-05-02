"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

export default function CreateQuestionPage() {
	const [question, setQuestion] = useState("");
	const [choices, setChoices] = useState(["", "", "", ""]);
	const [correctIndex, setCorrectIndex] = useState<number | null>(null);
	const [time, setTime] = useState("10");
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleOptionChange = (value: string, index: number) => {
		const updated = [...choices];
		updated[index] = value;
		setChoices(updated);
	};

	const handleSubmit = async () => {
		if (
			!question ||
			choices.some((opt) => !opt) ||
			correctIndex === null ||
			!time
		) {
			alert("Please fill out all fields and select the correct answer.");
			return;
		}

		const newQuestion = {
			question,
			choices1: choices[0],
			choices2: choices[1],
			choices3: choices[2],
			choices4: choices[3],
			correctAnswer: choices[correctIndex],
			time,
		};

		setLoading(true);
		try {
			await axios.post("http://localhost:3001/questions", newQuestion); // No id here
			setSubmitted(true);
		} catch (err) {
			console.error("Error submitting question:", err);
			alert("Failed to submit question.");
		} finally {
			setLoading(false);
		}
	};

	if (submitted) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
				<h1 className="text-2xl font-semibold text-green-600">
					Question Saved!
				</h1>
				<Button
					onClick={() => {
						setQuestion("");
						setChoices(["", "", "", ""]);
						setCorrectIndex(null);
						setTime("10");
						setSubmitted(false);
					}}
				>
					Add Another Question
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-xl mx-auto p-6 min-h-screen flex flex-col justify-center">
			<h1 className="text-3xl font-bold mb-6 text-center">
				Create Quiz Question
			</h1>

			<Textarea
				value={question}
				onChange={(e) => setQuestion(e.target.value)}
				placeholder="Enter your question"
				className="mb-4"
			/>

			{choices.map((choice, index) => (
				<div key={index} className="flex items-center gap-2 mb-3">
					<Input
						value={choice}
						onChange={(e) => handleOptionChange(e.target.value, index)}
						placeholder={`Option ${index + 1}`}
					/>
					<input
						type="radio"
						name="correct"
						checked={correctIndex === index}
						onChange={() => setCorrectIndex(index)}
						className="accent-green-500"
					/>
					<label className="text-sm">Correct</label>
				</div>
			))}

			<Input
				type="number"
				min="1"
				value={time}
				onChange={(e) => setTime(e.target.value)}
				placeholder="Time in seconds"
				className="mb-4"
			/>

			<Button className="w-full" onClick={handleSubmit} disabled={loading}>
				{loading ? "Saving..." : "Save Question"}
			</Button>
		</div>
	);
}
