"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Users,
	Activity,
	Cuboid,
	MessageSquare,
	Loader2,
	ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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

interface Room {
	id: string;
	name: string;
	description: string;
	maxParticipants: number;
	participants: number;
	questions: Question[]; // Nested questions inside room
}

export default function RoomQuizPage() {
	const queryClient = useQueryClient();
	const [activeRoom, setActiveRoom] = useState<Room | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [cumulativeScore, setCumulativeScore] = useState(0);
	const [isQuizCompleted, setIsQuizCompleted] = useState(false);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [timeRemaining, setTimeRemaining] = useState(10);
	const [isTimerActive, setIsTimerActive] = useState(false); // Start as false until we join
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isCompleted, setIsCompleted] = useState(false);
	const [timeBonus, setTimeBonus] = useState(0);
	const [answerScore, setAnswerScore] = useState(0);
	const [progressStage, setProgressStage] = useState(0);
	// State to track if we should show the answer
	const [showAnswer, setShowAnswer] = useState(false);

	// Fetch available rooms with auto-refresh enabled (polling)
	const {
		data: rooms,
		isLoading: isLoadingRooms,
		error: roomsError,
		refetch: refetchRooms,
	} = useQuery<Room[]>({
		queryKey: ["rooms"],
		queryFn: async () => {
			const res = await axios.get("http://localhost:3001/rooms");
			return res.data;
		},
		// Enable polling - refetch every 3 seconds
		refetchInterval: 3000,
		// Keep fetching even when the tab is not active
		refetchIntervalInBackground: true,
	});

	// Update the active room data when rooms are refreshed
	useEffect(() => {
		if (activeRoom && rooms) {
			const updatedRoom = rooms.find((room) => room.id === activeRoom.id);
			if (updatedRoom) {
				setActiveRoom(updatedRoom);
			}
		}
	}, [rooms, activeRoom]);

	// Join session mutation
	const joinSessionMutation = useMutation({
		mutationFn: async (room: Room) => {
			if (room.participants < room.maxParticipants) {
				const updatedParticipants = room.participants + 1;
				const res = await axios.patch(
					`http://localhost:3001/rooms/${room.id}`,
					{ participants: updatedParticipants }
				);
				return res.data;
			}
			throw new Error("Room is full");
		},
		onSuccess: (data) => {
			// Reset all quiz state variables when joining a room
			resetQuizState();
			setActiveRoom(data);
			queryClient.invalidateQueries({ queryKey: ["rooms"] });
		},
	});

	// Reset all quiz states
	const resetQuizState = () => {
		setCurrentQuestionIndex(0);
		setCumulativeScore(0);
		setIsQuizCompleted(false);
		setSelectedAnswer(null);
		setTimeRemaining(10);
		setIsTimerActive(true);
		setIsSubmitted(false);
		setIsCompleted(false);
		setTimeBonus(0);
		setAnswerScore(0);
		setProgressStage(0);
		setShowAnswer(false);
	};

	// Get current question from the active room
	const questionData: Question | null =
		activeRoom?.questions &&
		activeRoom.questions.length > 0 &&
		currentQuestionIndex < activeRoom.questions.length
			? activeRoom.questions[currentQuestionIndex]
			: null;

	// Get question timer value or default to 10 sec
	const defaultTime = 10;
	const parsedTime = questionData
		? parseFloat(questionData.time) || defaultTime
		: defaultTime;

	// Reset states when a new question loads
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
			setShowAnswer(false);
		}
	}, [questionData, parsedTime]);

	// Timer effect
	useEffect(() => {
		if (!isTimerActive || !activeRoom || !questionData) {
			return;
		}

		const timer = setInterval(() => {
			setTimeRemaining((prevTime) => {
				if (prevTime <= 0.1) {
					clearInterval(timer);
					setIsTimerActive(false);
					setIsCompleted(true);
					setShowAnswer(true); // Show the answer when timer reaches zero
					return 0;
				}
				return prevTime - 0.1;
			});
		}, 100);

		return () => clearInterval(timer);
	}, [isTimerActive, activeRoom, questionData]);

	// Handle progress stages after question completion
	useEffect(() => {
		if (isCompleted && questionData && showAnswer) {
			const timer1 = setTimeout(() => setProgressStage(1), 1000);
			const timer2 = setTimeout(() => setProgressStage(2), 2000);
			const timer3 = setTimeout(() => setProgressStage(3), 3000);
			const timer4 = setTimeout(() => {
				if (
					activeRoom?.questions &&
					currentQuestionIndex < activeRoom.questions.length - 1
				) {
					setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
				} else {
					setIsQuizCompleted(true);
				}
			}, 4000);

			return () => {
				clearTimeout(timer1);
				clearTimeout(timer2);
				clearTimeout(timer3);
				clearTimeout(timer4);
			};
		}
	}, [isCompleted, currentQuestionIndex, questionData, showAnswer, activeRoom]);

	// Calculate time bonus based on remaining time
	const calculateTimeBonus = () => {
		return Math.floor((timeRemaining / parsedTime) * 400);
	};

	// Handle answer selection
	const handleAnswerChange = (value: string) => {
		if (!isSubmitted) {
			setSelectedAnswer(value);
		}
	};

	// Submit answer
	const handleSubmit = () => {
		if (!isSubmitted && selectedAnswer && questionData) {
			setIsSubmitted(true);

			// Calculate scores but don't set completed yet - wait for timer
			const isCorrect = selectedAnswer === questionData.correctAnswer;
			const bonus = isCorrect ? calculateTimeBonus() : 0;
			setTimeBonus(bonus);
			const score = isCorrect ? 600 : 0;
			setAnswerScore(score);
			setCumulativeScore((prev) => prev + bonus + score);

			// If time has already expired, show answer immediately
			if (timeRemaining <= 0) {
				setShowAnswer(true);
				setIsCompleted(true);
			}
			// Otherwise wait for timer to complete
		}
	};

	// Exit room
	const handleExitRoom = () => {
		// Update the room participants count when exiting
		if (activeRoom) {
			axios
				.patch(`http://localhost:3001/rooms/${activeRoom.id}`, {
					participants: Math.max(0, activeRoom.participants - 1),
				})
				.then(() => {
					queryClient.invalidateQueries({ queryKey: ["rooms"] });
				});
		}

		// Reset all state related to the quiz
		resetQuizState();
		setActiveRoom(null);
	};

	// Try quiz again
	const handleTryAgain = () => {
		resetQuizState();
	};

	// Handle window unload/close to decrement participant count
	useEffect(() => {
		const handleBeforeUnload = () => {
			if (activeRoom) {
				// Make a synchronous request to update participant count when closing window
				const xhr = new XMLHttpRequest();
				xhr.open(
					"PATCH",
					`http://localhost:3001/rooms/${activeRoom.id}`,
					false
				);
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.send(
					JSON.stringify({
						participants: Math.max(0, activeRoom.participants - 1),
					})
				);
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [activeRoom]);

	// Loading states
	if (isLoadingRooms) {
		return (
			<div className="flex flex-col items-center justify-center h-screen">
				<Loader2 className="animate-spin" size={48} />
				<span className="mt-4 text-xl">Loading rooms...</span>
			</div>
		);
	}

	if (roomsError) return <div>Error loading rooms</div>;

	// Stats for room list view
	const activeRooms = rooms
		? rooms.filter((room) => room.participants < room.maxParticipants).length
		: 0;
	const onlineUsers = rooms
		? rooms.reduce((sum, room) => sum + room.participants, 0)
		: 0;

	const getBadgeStatus = (room: Room) => {
		if (room.participants >= room.maxParticipants) return "Full";
		if (room.participants / room.maxParticipants >= 0.7) return "Busy";
		return "Open";
	};

	const getBadgeColor = (status: string) => {
		switch (status) {
			case "Full":
				return "bg-red-500";
			case "Busy":
				return "bg-yellow-500";
			default:
				return "bg-green-600";
		}
	};

	// Timer bar width calculation
	const timerWidth = `${(timeRemaining / parsedTime) * 100}%`;

	// Render room list if no active room
	if (!activeRoom) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Room Quiz</h1>
					<p className="text-muted-foreground">
						Real-Life Simulations, Limitless Learning 🚀
					</p>
					<div className="mt-2 text-sm text-gray-500">
						<span className="inline-flex items-center gap-1">
							<Loader2 className="h-3 w-3 animate-spin" />
							Live updating - Refreshes automatically
						</span>
					</div>
				</div>

				{/* Summary Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
					<div className="bg-white rounded-lg p-6 shadow-sm border">
						<div className="flex items-center gap-4">
							<div className="bg-blue-50 p-2 rounded-lg">
								<Activity className="w-6 h-6 text-blue-600" />
							</div>
							<div>
								<div className="text-2xl font-bold">{activeRooms}</div>
								<div className="text-muted-foreground text-sm">
									Active Rooms
								</div>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-lg p-6 shadow-sm border">
						<div className="flex items-center gap-4">
							<div className="bg-blue-50 p-2 rounded-lg">
								<Users className="w-6 h-6 text-blue-600" />
							</div>
							<div>
								<div className="text-2xl font-bold">{onlineUsers}</div>
								<div className="text-muted-foreground text-sm">
									Online Users
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Room Cards */}
				<div className="space-y-4">
					{!rooms || rooms.length === 0 ? (
						<div className="flex justify-center items-center h-32">
							<p className="text-gray-500">Empty Room 😴</p>
						</div>
					) : (
						rooms.map((room) => {
							const badgeStatus = getBadgeStatus(room);
							const badgeColor = getBadgeColor(badgeStatus);
							return (
								<div
									key={room.id}
									className="bg-white rounded-lg p-6 shadow-sm border"
								>
									<div className="flex flex-col sm:flex-row justify-between items-start mb-6">
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Cuboid className="w-5 h-5 text-blue-600" />
												<h2 className="text-xl font-semibold">{room.name}</h2>
											</div>
											<p className="text-muted-foreground">
												{room.description}
											</p>
										</div>
										<Badge className={`${badgeColor} hidden sm:block`}>
											{badgeStatus}
										</Badge>
									</div>

									<div className="flex flex-col sm:flex-row items-center justify-between">
										<div className="flex items-center gap-2 mb-4 sm:mb-0">
											<Users className="w-4 h-4 text-muted-foreground" />
											<span className="text-sm text-muted-foreground">
												{room.participants}/{room.maxParticipants} participants
											</span>
											<Badge className={`${badgeColor} sm:hidden ml-2`}>
												{badgeStatus}
											</Badge>
										</div>

										<div className="flex items-center gap-4">
											<div className="flex -space-x-2">
												{room.participants > 3 ? (
													<>
														{[...Array(3)].map((_, i) => (
															<Avatar key={i} className="border-2 border-white">
																<AvatarFallback>{`U${i + 1}`}</AvatarFallback>
															</Avatar>
														))}
														<Avatar className="border-2 border-white">
															<AvatarFallback>
																+{room.participants - 3}
															</AvatarFallback>
														</Avatar>
													</>
												) : (
													[...Array(room.participants)].map((_, i) => (
														<Avatar key={i} className="border-2 border-white">
															<AvatarFallback>{`U${i + 1}`}</AvatarFallback>
														</Avatar>
													))
												)}
											</div>
											<Button
												variant="outline"
												className="gap-2"
												onClick={() => console.log("Chat button clicked")}
											>
												<MessageSquare className="w-4 h-4" />
												Chat
											</Button>
											<Button
												className="bg-gray-900 text-white hover:bg-gray-800"
												onClick={() => {
													if (room.participants < room.maxParticipants) {
														joinSessionMutation.mutate(room);
													}
												}}
												disabled={room.participants >= room.maxParticipants}
											>
												Join Session
											</Button>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		);
	}

	// Quiz view once a room is joined
	return (
		<div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
			{/* Room header with back button */}
			<div className="mb-6 flex items-center">
				<Button
					variant="outline"
					size="icon"
					onClick={handleExitRoom}
					className="mr-4"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold">{activeRoom.name}</h1>
					<p className="text-muted-foreground">{activeRoom.description}</p>
					<div className="mt-1 text-sm text-gray-500 flex items-center gap-1">
						<Users className="h-3 w-3" />
						<span>
							{activeRoom.participants}/{activeRoom.maxParticipants}{" "}
							participants
						</span>
						<span className="inline-flex items-center gap-1 ml-2">
							<Loader2 className="h-3 w-3 animate-spin" />
							Live updating
						</span>
					</div>
				</div>
			</div>

			{!activeRoom.questions || activeRoom.questions.length === 0 ? (
				<div className="text-center py-12">
					<h2 className="text-2xl font-semibold mb-4">
						No questions available
					</h2>
					<p className="text-muted-foreground mb-6">
						This room doesn't have any questions yet.
					</p>
					<Button onClick={handleExitRoom}>Return to Room List</Button>
				</div>
			) : (
				<div className="flex items-center justify-center p-4">
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

						{/* Question Progress Indicator */}
						<div className="text-sm text-muted-foreground">
							Question {currentQuestionIndex + 1} of{" "}
							{activeRoom.questions.length}
						</div>

						{/* Question Header */}
						<div className="w-full">
							<h2 className="text-xl font-semibold">
								{questionData?.question}
							</h2>
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
												<Label
													htmlFor="choice1"
													className="cursor-pointer block"
												>
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
												<Label
													htmlFor="choice2"
													className="cursor-pointer block"
												>
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
												<Label
													htmlFor="choice3"
													className="cursor-pointer block"
												>
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
												<Label
													htmlFor="choice4"
													className="cursor-pointer block"
												>
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
								{!showAnswer ? (
									// Show waiting state while timer runs out
									<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
										<div className="flex items-center justify-center gap-2 mb-2">
											<Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
											<h3 className="font-medium text-yellow-700">
												Waiting for timer...
											</h3>
										</div>
										<p className="text-yellow-600 text-center">
											The answer will be revealed when the timer ends!
										</p>
									</div>
								) : (
									// Show answer after timer expires
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
												: `The correct answer is ${
														questionData?.correctAnswer
												  }. You selected ${selectedAnswer || "nothing"}.`}
										</p>
									</div>
								)}

								{showAnswer && (
									<div className="bg-gray-50 p-4 rounded-lg border">
										<h3 className="font-medium mb-2">
											Your Score for this question
										</h3>
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
								)}

								{/* 3-Part Progress Bar - Only show when answer is revealed */}
								{showAnswer && (
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
								)}
							</div>
						)}
						{isQuizCompleted && (
							<div className="space-y-6 animate-fadeIn">
								<div className="bg-gray-50 p-4 rounded-lg border">
									<h3 className="font-medium mb-2">Quiz Completed!</h3>
									<div className="space-y-1">
										<div className="flex justify-between">
											<span>Total Cumulative Score:</span>
											<span className="font-medium">{cumulativeScore}</span>
										</div>
										<div className="h-px bg-gray-200 my-2"></div>
										<div className="flex justify-between text-lg font-bold">
											<span>Your Final Score:</span>
											<span>{cumulativeScore}</span>
										</div>
									</div>
								</div>
								<div className="flex gap-4">
									<Button onClick={handleTryAgain} className="w-1/2">
										Try Again
									</Button>
									<Button onClick={handleExitRoom} className="w-1/2">
										Exit Room
									</Button>
								</div>
							</div>
						)}
					</main>
				</div>
			)}
		</div>
	);
}
