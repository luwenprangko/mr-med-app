"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export default function QuizPage() {
	// Configurable time in seconds - change this value to adjust the timer
	const totalTime = 10;
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [timeRemaining, setTimeRemaining] = useState(totalTime);
	const [isTimerActive, setIsTimerActive] = useState(true);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isCompleted, setIsCompleted] = useState(false);
	const [timeBonus, setTimeBonus] = useState(0);
	const [answerScore, setAnswerScore] = useState(0);
	const [totalScore, setTotalScore] = useState(0);

	// The correct answer
	const correctAnswer = "paris";

	const handleAnswerChange = (value: string) => {
		if (!isSubmitted) {
			setSelectedAnswer(value);
		}
	};

	const calculateTimeBonus = () => {
		// Calculate time bonus: max 400 points, decreasing to 0 as time runs out
		const calculatedBonus = Math.floor((timeRemaining / totalTime) * 400);
		return calculatedBonus;
	};

	const handleSubmit = () => {
		if (!isSubmitted && selectedAnswer) {
			setIsSubmitted(true);

			// Calculate and store the time bonus (only if answer is correct)
			const isCorrect = selectedAnswer === correctAnswer;
			const bonus = isCorrect ? calculateTimeBonus() : 0;
			setTimeBonus(bonus);

			// Calculate answer score (600 if correct, 0 if wrong)
			const score = isCorrect ? 600 : 0;
			setAnswerScore(score);

			// Calculate total score
			setTotalScore(bonus + score);

			// Keep the timer running until it completes
			// The results will be displayed after the timer runs out
		}
	};

	useEffect(() => {
		if (!isTimerActive) {
			// Timer has stopped, show the results
			setIsCompleted(true);
			return;
		}

		const timer = setInterval(() => {
			setTimeRemaining((prevTime) => {
				if (prevTime <= 0.1) {
					clearInterval(timer);
					setIsTimerActive(false);
					return 0;
				}
				return prevTime - 0.1;
			});
		}, 100);

		return () => clearInterval(timer);
	}, [isTimerActive]);

	// Calculate timer bar width as a percentage
	const timerWidth = `${(timeRemaining / totalTime) * 100}%`;

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<main className="w-full max-w-[600px] space-y-6 rounded-lg border p-6 shadow-sm">
				{/* Timer bar */}
				<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
					<div
						className={`h-full transition-all duration-100 ease-linear ${
							isSubmitted ? "bg-yellow-500" : "bg-primary"
						}`}
						style={{ width: timerWidth }}
					/>
				</div>

				{/* Top row - Question */}
				<div className="w-full">
					<h2 className="text-xl font-semibold">
						What is the capital of France?
					</h2>
					<p className="text-muted-foreground">
						Select the correct answer from the options below.
					</p>
				</div>

				{/* Conditional rendering: Show choices or scoring system */}
				{!isCompleted ? (
					<>
						{/* Answer options in a single column */}
						<RadioGroup
							value={selectedAnswer || ""}
							onValueChange={handleAnswerChange}
							className="grid grid-cols-1 gap-4"
						>
							{/* Option 1 */}
							<div className="relative">
								<Card
									className={`cursor-pointer transition-all ${
										selectedAnswer === "paris"
											? "border-primary ring-2 ring-primary"
											: ""
									}`}
									onClick={() => handleAnswerChange("paris")}
								>
									<div className="absolute right-2 top-2">
										<RadioGroupItem
											value="paris"
											id="paris"
											className="h-5 w-5"
										/>
									</div>
									<CardContent className="p-4 pt-8 pb-6">
										<Label htmlFor="paris" className="cursor-pointer block">
											Paris - The City of Light is the capital and most populous
											city of France, known for its art, fashion, gastronomy,
											and culture.
										</Label>
									</CardContent>
								</Card>
							</div>

							{/* Option 2 */}
							<div className="relative">
								<Card
									className={`cursor-pointer transition-all ${
										selectedAnswer === "london"
											? "border-primary ring-2 ring-primary"
											: ""
									}`}
									onClick={() => handleAnswerChange("london")}
								>
									<div className="absolute right-2 top-2">
										<RadioGroupItem
											value="london"
											id="london"
											className="h-5 w-5"
										/>
									</div>
									<CardContent className="p-4 pt-8 pb-6">
										<Label htmlFor="london" className="cursor-pointer block">
											London - The capital and largest city of England and the
											United Kingdom, standing on the River Thames.
										</Label>
									</CardContent>
								</Card>
							</div>

							{/* Option 3 */}
							<div className="relative">
								<Card
									className={`cursor-pointer transition-all ${
										selectedAnswer === "berlin"
											? "border-primary ring-2 ring-primary"
											: ""
									}`}
									onClick={() => handleAnswerChange("berlin")}
								>
									<div className="absolute right-2 top-2">
										<RadioGroupItem
											value="berlin"
											id="berlin"
											className="h-5 w-5"
										/>
									</div>
									<CardContent className="p-4 pt-8 pb-6">
										<Label htmlFor="berlin" className="cursor-pointer block">
											Berlin - The capital and largest city of Germany, known
											for its cultural history, art scene, and modern
											architecture.
										</Label>
									</CardContent>
								</Card>
							</div>

							{/* Option 4 */}
							<div className="relative">
								<Card
									className={`cursor-pointer transition-all ${
										selectedAnswer === "madrid"
											? "border-primary ring-2 ring-primary"
											: ""
									}`}
									onClick={() => handleAnswerChange("madrid")}
								>
									<div className="absolute right-2 top-2">
										<RadioGroupItem
											value="madrid"
											id="madrid"
											className="h-5 w-5"
										/>
									</div>
									<CardContent className="p-4 pt-8 pb-6">
										<Label htmlFor="madrid" className="cursor-pointer block">
											Madrid - The capital and most populous city of Spain,
											located on the Manzanares River in the center of the
											country.
										</Label>
									</CardContent>
								</Card>
							</div>
						</RadioGroup>

						{/* Submit button */}
						<Button
							className="w-full"
							disabled={!selectedAnswer || isSubmitted}
							onClick={handleSubmit}
						>
							{isSubmitted ? "Waiting for timer..." : "Submit Answer"}
						</Button>
					</>
				) : (
					/* Scoring System - Shown after timer completes */
					<div className="space-y-6 animate-fadeIn">
						<div
							className={`p-4 rounded-lg ${
								selectedAnswer === correctAnswer
									? "bg-green-50 border border-green-200"
									: "bg-red-50 border border-red-200"
							}`}
						>
							<div className="flex items-center gap-2 mb-2">
								{selectedAnswer === correctAnswer ? (
									<>
										<CheckCircle2 className="h-5 w-5 text-green-500" />
										<h3 className="font-medium text-green-700">
											Correct Answer!
										</h3>
									</>
								) : (
									<>
										<XCircle className="h-5 w-5 text-red-500" />
										<h3 className="font-medium text-red-700">
											Incorrect Answer
										</h3>
									</>
								)}
							</div>
							<p
								className={
									selectedAnswer === correctAnswer
										? "text-green-600"
										: "text-red-600"
								}
							>
								{selectedAnswer === correctAnswer
									? "Great job! Paris is indeed the capital of France."
									: `The correct answer is Paris, the capital of France. You selected ${selectedAnswer}.`}
							</p>
						</div>

						<div className="bg-gray-50 p-4 rounded-lg border">
							<h3 className="font-medium mb-2">Your Score</h3>
							<div className="space-y-1">
								<div className="flex justify-between">
									<span>Answer Score:</span>
									<span className="font-medium">{answerScore}</span>
								</div>
								<div className="flex justify-between">
									<span>Time Bonus:</span>
									<span className="font-medium">{timeBonus}</span>
								</div>
								<div className="h-px bg-gray-200 my-2"></div>
								<div className="flex justify-between text-lg font-bold">
									<span>Total Score:</span>
									<span>{totalScore}</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
