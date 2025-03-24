"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface Question {
	id: string;
	question: string;
	choices1: string;
	choices2: string;
	choices3: string;
	choices4: string;
	correctAnswer: string;
	time: string;
}

export default function QuizPage() {
	// Fetch questions from the JSON Server
	const {
		data: questions,
		isLoading,
		error,
	} = useQuery<Question[]>({
		queryKey: ["questions"],
		queryFn: async () => {
			const res = await axios.get("http://localhost:3001/questions");
			return res.data;
		},
	});

	// Track current question index and overall score.
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [cumulativeScore, setCumulativeScore] = useState(0);

	// Derived current question or null if not available.
	const questionData: Question | null =
		questions && questions.length > 0 && currentQuestionIndex < questions.length
			? questions[currentQuestionIndex]
			: null;

	// Get question timer value or default to 10 sec.
	const defaultTime = 10;
	const parsedTime = questionData
		? parseFloat(questionData.time) || defaultTime
		: defaultTime;

	// States for quiz and timer.
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [timeRemaining, setTimeRemaining] = useState(parsedTime);
	const [isTimerActive, setIsTimerActive] = useState(true);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isCompleted, setIsCompleted] = useState(false);
	const [timeBonus, setTimeBonus] = useState(0);
	const [answerScore, setAnswerScore] = useState(0);

	// Progress bar state: 0 means no segment filled, up to 3 segments.
	const [progressStage, setProgressStage] = useState(0);

	// When a new question loads, reset all states.
	useEffect(() => {
		if (questionData) {
			setTimeRemaining(parsedTime);
			setIsTimerActive(true);
			setIsSubmitted(false);
			setIsCompleted(false);
			setSelectedAnswer(null);
			setTimeBonus(0);
			setAnswerScore(0);
			setProgressStage(0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [questionData]);

	// Timer effect for the question.
	useEffect(() => {
		if (!isTimerActive) {
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

	// Calculate bonus points based on remaining time.
	const calculateTimeBonus = () => {
		return Math.floor((timeRemaining / parsedTime) * 400);
	};

	// Handle answer selection.
	const handleAnswerChange = (value: string) => {
		if (!isSubmitted) {
			setSelectedAnswer(value);
		}
	};

	// When answer is submitted, calculate score.
	const handleSubmit = () => {
		if (!isSubmitted && selectedAnswer && questionData) {
			setIsSubmitted(true);
			const isCorrect = selectedAnswer === questionData.correctAnswer;
			const bonus = isCorrect ? calculateTimeBonus() : 0;
			setTimeBonus(bonus);
			const score = isCorrect ? 600 : 0;
			setAnswerScore(score);
			setCumulativeScore((prev) => prev + bonus + score);
			// The progress bar will start after the question completes.
		}
	};

	// After the question is completed, start the 3-part progress bar.
	useEffect(() => {
		if (isCompleted) {
			// Timer to fill each progress bar segment.
			const timer1 = setTimeout(() => setProgressStage(1), 2000);
			const timer2 = setTimeout(() => setProgressStage(2), 4000);
			const timer3 = setTimeout(() => setProgressStage(3), 6000);
			// Additional 2-sec delay after green is visible.
			const timer4 = setTimeout(() => {
				if (questions && currentQuestionIndex < questions.length - 1) {
					setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
				}
			}, 8000);

			return () => {
				clearTimeout(timer1);
				clearTimeout(timer2);
				clearTimeout(timer3);
				clearTimeout(timer4);
			};
		}
	}, [isCompleted, questions, currentQuestionIndex]);

	// Calculate timer bar width.
	const timerWidth = `${(timeRemaining / parsedTime) * 100}%`;

	// Render loading or error states.
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				Loading...
			</div>
		);
	}

	// If no more questions, show final summary.
	if (error || (questions && currentQuestionIndex >= questions.length)) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<main className="w-full max-w-[600px] space-y-6 rounded-lg border p-6 shadow-sm">
					<h2 className="text-xl font-semibold">Quiz Completed</h2>
					<p className="text-muted-foreground">
						Your final score is: {cumulativeScore}
					</p>
				</main>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<main className="w-full max-w-[600px] space-y-6 rounded-lg border p-6 shadow-sm">
				{/* Timer Bar */}
				<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
					<div
						className={`h-full transition-all duration-100 ease-linear ${
							isSubmitted ? "bg-yellow-500" : "bg-primary"
						}`}
						style={{ width: timerWidth }}
					/>
				</div>

				{/* Question Header */}
				<div className="w-full">
					<h2 className="text-xl font-semibold">{questionData?.question}</h2>
					<p className="text-muted-foreground">
						Select the correct answer from the options below.
					</p>
				</div>

				{/* Quiz Content or Result */}
				{!isCompleted ? (
					<>
						<RadioGroup
							value={selectedAnswer || ""}
							onValueChange={handleAnswerChange}
							className="grid grid-cols-1 gap-4"
						>
							{/* Option 1 */}
							<div className="relative">
								<Card
									className={`cursor-pointer transition-all ${
										selectedAnswer === questionData?.choices1
											? "border-primary ring-2 ring-primary"
											: ""
									}`}
									onClick={() => handleAnswerChange(questionData!.choices1)}
								>
									<div className="absolute right-2 top-2">
										<RadioGroupItem
											value={questionData!.choices1}
											id="choice1"
											className="h-5 w-5"
										/>
									</div>
									<CardContent className="p-4 pt-8 pb-6">
										<Label htmlFor="choice1" className="cursor-pointer block">
											{questionData?.choices1}
										</Label>
									</CardContent>
								</Card>
							</div>

							{/* Option 2 */}
							<div className="relative">
								<Card
									className={`cursor-pointer transition-all ${
										selectedAnswer === questionData?.choices2
											? "border-primary ring-2 ring-primary"
											: ""
									}`}
									onClick={() => handleAnswerChange(questionData!.choices2)}
								>
									<div className="absolute right-2 top-2">
										<RadioGroupItem
											value={questionData!.choices2}
											id="choice2"
											className="h-5 w-5"
										/>
									</div>
									<CardContent className="p-4 pt-8 pb-6">
										<Label htmlFor="choice2" className="cursor-pointer block">
											{questionData?.choices2}
										</Label>
									</CardContent>
								</Card>
							</div>

							{/* Option 3 */}
							<div className="relative">
								<Card
									className={`cursor-pointer transition-all ${
										selectedAnswer === questionData?.choices3
											? "border-primary ring-2 ring-primary"
											: ""
									}`}
									onClick={() => handleAnswerChange(questionData!.choices3)}
								>
									<div className="absolute right-2 top-2">
										<RadioGroupItem
											value={questionData!.choices3}
											id="choice3"
											className="h-5 w-5"
										/>
									</div>
									<CardContent className="p-4 pt-8 pb-6">
										<Label htmlFor="choice3" className="cursor-pointer block">
											{questionData?.choices3}
										</Label>
									</CardContent>
								</Card>
							</div>

							{/* Option 4 */}
							<div className="relative">
								<Card
									className={`cursor-pointer transition-all ${
										selectedAnswer === questionData?.choices4
											? "border-primary ring-2 ring-primary"
											: ""
									}`}
									onClick={() => handleAnswerChange(questionData!.choices4)}
								>
									<div className="absolute right-2 top-2">
										<RadioGroupItem
											value={questionData!.choices4}
											id="choice4"
											className="h-5 w-5"
										/>
									</div>
									<CardContent className="p-4 pt-8 pb-6">
										<Label htmlFor="choice4" className="cursor-pointer block">
											{questionData?.choices4}
										</Label>
									</CardContent>
								</Card>
							</div>
						</RadioGroup>

						{/* Submit Button */}
						<Button
							className="w-full"
							disabled={!selectedAnswer || isSubmitted}
							onClick={handleSubmit}
						>
							{isSubmitted ? "Waiting for timer..." : "Submit Answer"}
						</Button>
					</>
				) : (
					// Display results for this question and the 3-part progress bar.
					<div className="space-y-6 animate-fadeIn">
						<div
							className={`p-4 rounded-lg ${
								selectedAnswer === questionData?.correctAnswer
									? "bg-green-50 border border-green-200"
									: "bg-red-50 border border-red-200"
							}`}
						>
							<div className="flex items-center gap-2 mb-2">
								{selectedAnswer === questionData?.correctAnswer ? (
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
									selectedAnswer === questionData?.correctAnswer
										? "text-green-600"
										: "text-red-600"
								}
							>
								{selectedAnswer === questionData?.correctAnswer
									? "Great job! That is correct."
									: `The correct answer is ${questionData?.correctAnswer}. You selected ${selectedAnswer}.`}
							</p>
						</div>

						<div className="bg-gray-50 p-4 rounded-lg border">
							<h3 className="font-medium mb-2">Your Score for this question</h3>
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
									<span>Total Score (Accumulated):</span>
									<span>{cumulativeScore}</span>
								</div>
							</div>
						</div>

						{/* 3-Part Progress Bar */}
						<div className="flex space-x-1 mt-4">
							<div
								className={`w-1/3 h-2 transition-all duration-500 ${
									progressStage >= 1 ? "bg-red-500" : "bg-gray-300"
								}`}
							></div>
							<div
								className={`w-1/3 h-2 transition-all duration-500 ${
									progressStage >= 2 ? "bg-orange-400" : "bg-gray-300"
								}`}
							></div>
							<div
								className={`w-1/3 h-2 transition-all duration-500 ${
									progressStage >= 3 ? "bg-green-500" : "bg-gray-300"
								}`}
							></div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
