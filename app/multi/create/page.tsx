"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

export default function CreateRoomPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		maxParticipants: 5,
	});

	const [questions, setQuestions] = useState([
		{
			id: "1",
			question: "",
			choices1: "",
			choices2: "",
			choices3: "",
			choices4: "",
			correctAnswer: "",
			time: "5",
		},
	]);

	const handleRoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleQuestionChange = (
		index: number,
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.target;
		setQuestions((prev) => {
			const updated = [...prev];
			updated[index][name] = value;
			return updated;
		});
	};

	const addQuestion = () => {
		setQuestions((prev) => [
			...prev,
			{
				id: (prev.length + 1).toString(),
				question: "",
				choices1: "",
				choices2: "",
				choices3: "",
				choices4: "",
				correctAnswer: "",
				time: "5",
			},
		]);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Step 1: Create the room
			const roomRes = await axios.post("http://localhost:3001/rooms", {
				...formData,
				participants: 0,
			});
			const roomId = roomRes.data.id;

			// Step 2: Create questions under roomId
			await axios.patch(`http://localhost:3001/questions`, {
				[roomId]: questions,
			});

			router.push("/multi");
		} catch (error) {
			console.error("Error creating room or questions", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto px-4 py-10">
			<h1 className="text-3xl font-bold mb-6">Create a Room & Questions 🎓</h1>
			<form onSubmit={handleSubmit} className="space-y-8">
				<div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
					<h2 className="text-xl font-semibold mb-2">Room Info 🏠</h2>
					<div>
						<Label htmlFor="name">Room Name</Label>
						<Input
							id="name"
							name="name"
							value={formData.name}
							onChange={handleRoomChange}
							required
						/>
					</div>
					<div>
						<Label htmlFor="description">Description</Label>
						<Input
							id="description"
							name="description"
							value={formData.description}
							onChange={handleRoomChange}
							required
						/>
					</div>
					<div>
						<Label htmlFor="maxParticipants">Max Participants</Label>
						<Input
							id="maxParticipants"
							name="maxParticipants"
							type="number"
							min={1}
							max={50}
							value={formData.maxParticipants}
							onChange={handleRoomChange}
							required
						/>
					</div>
				</div>

				<div className="bg-white p-6 rounded-xl shadow-md border space-y-6">
					<h2 className="text-xl font-semibold">Questions ❓</h2>
					{questions.map((q, index) => (
						<div key={index} className="grid gap-4 border-b pb-4">
							<Label>Question {index + 1}</Label>
							<Input
								name="question"
								placeholder="Question"
								value={q.question}
								onChange={(e) => handleQuestionChange(index, e)}
								required
							/>
							<Input
								name="choices1"
								placeholder="Choice A"
								value={q.choices1}
								onChange={(e) => handleQuestionChange(index, e)}
								required
							/>
							<Input
								name="choices2"
								placeholder="Choice B"
								value={q.choices2}
								onChange={(e) => handleQuestionChange(index, e)}
								required
							/>
							<Input
								name="choices3"
								placeholder="Choice C"
								value={q.choices3}
								onChange={(e) => handleQuestionChange(index, e)}
								required
							/>
							<Input
								name="choices4"
								placeholder="Choice D"
								value={q.choices4}
								onChange={(e) => handleQuestionChange(index, e)}
								required
							/>
							<Input
								name="correctAnswer"
								placeholder="Correct Answer (e.g. a)"
								value={q.correctAnswer}
								onChange={(e) => handleQuestionChange(index, e)}
								required
							/>
							<Input
								name="time"
								placeholder="Time (in seconds)"
								type="number"
								value={q.time}
								onChange={(e) => handleQuestionChange(index, e)}
								required
							/>
						</div>
					))}
					<Button type="button" variant="outline" onClick={addQuestion}>
						<Plus className="w-4 h-4 mr-2" /> Add Another Question
					</Button>
				</div>

				<Button type="submit" disabled={isLoading} className="w-full">
					{isLoading ? (
						<Loader2 className="animate-spin w-4 h-4 mr-2" />
					) : (
						"Create Room & Save Questions ✅"
					)}
				</Button>
			</form>
		</div>
	);
}
