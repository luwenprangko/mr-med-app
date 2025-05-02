"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  ArrowLeft, 
  PlusCircle, 
  Clock, 
  Users, 
  Trash2, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function CreateRoomAndQuestionPage() {
	const router = useRouter();
	const [isRoomCreated, setIsRoomCreated] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [roomId, setRoomId] = useState<string | null>(null);
	const [roomQuestions, setRoomQuestions] = useState<any[]>([]);
	const [roomData, setRoomData] = useState<any>(null);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		maxParticipants: 5,
		participants: 0,
	});

	const [question, setQuestion] = useState("");
	const [choices, setChoices] = useState(["", "", "", ""]);
	const [correctIndex, setCorrectIndex] = useState<number | null>(null);
	const [time, setTime] = useState("10");
	const [loadingQuestion, setLoadingQuestion] = useState(false);
	const [activeTab, setActiveTab] = useState("create");

	// Fetch existing room data if roomId exists
	useEffect(() => {
		if (roomId) {
			fetchRoomData();
		}
	}, [roomId]);

	const fetchRoomData = async () => {
		if (!roomId) return;

		try {
			const res = await axios.get(`http://localhost:3001/rooms/${roomId}`);
			if (res.data) {
				setRoomData(res.data);
				setRoomQuestions(res.data.questions || []);
			}
		} catch (error) {
			console.error("Error fetching room data:", error);
		}
	};

	const handleRoomChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleOptionChange = (value: string, index: number) => {
		const updated = [...choices];
		updated[index] = value;
		setChoices(updated);
	};

	const handleRoomSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const roomPayload = {
				...formData,
				questions: [], // Initialize with empty questions array
			};

			const res = await axios.post("http://localhost:3001/rooms", roomPayload);

			setRoomId(res.data.id);
			setRoomData(res.data);
			setIsRoomCreated(true);
		} catch (error) {
			console.error("Error creating room:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleQuestionSubmit = async () => {
		if (
			!question ||
			choices.some((opt) => !opt) ||
			correctIndex === null ||
			!time ||
			!roomId
		) {
			return;
		}

		setLoadingQuestion(true);

		try {
			// Create the new question object
			const newQuestion = {
				id: generateId(),
				question,
				choices1: choices[0],
				choices2: choices[1],
				choices3: choices[2],
				choices4: choices[3],
				correctAnswer: choices[correctIndex],
				time,
			};

			// Get the most up-to-date room data
			const roomResponse = await axios.get(
				`http://localhost:3001/rooms/${roomId}`
			);
			const currentRoom = roomResponse.data;

			// Create updated questions array
			const updatedQuestions = [...(currentRoom.questions || []), newQuestion];

			// Send the full updated room object to the server
			const updatedRoom = {
				...currentRoom,
				questions: updatedQuestions,
			};

			const updateResponse = await axios.put(
				`http://localhost:3001/rooms/${roomId}`,
				updatedRoom
			);

			// Update local state with the latest from the server
			setRoomData(updateResponse.data);
			setRoomQuestions(updateResponse.data.questions || []);

			// Reset form for next question
			resetQuestionForm();
		} catch (err: any) {
			console.error("Error submitting question:", err);
		} finally {
			setLoadingQuestion(false);
		}
	};

	const resetQuestionForm = () => {
		setQuestion("");
		setChoices(["", "", "", ""]);
		setCorrectIndex(null);
		setTime("10");
	};

	// Helper function to generate a simple ID
	const generateId = () => {
		return Math.random().toString(16).substring(2, 8);
	};

	return (
		<div className="container max-w-4xl mx-auto px-4 py-10">
			{!isRoomCreated ? (
				<>
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-3xl font-bold">Create Quiz Room 🎓</h1>
							<p className="text-muted-foreground mt-1">
								Set up a new quiz room for participants to join
							</p>
						</div>
						<Button variant="outline" onClick={() => router.push("/multi")}>
							<ArrowLeft className="w-4 h-4 mr-2" /> Back to Lobby
						</Button>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Room Details</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleRoomSubmit} className="space-y-6">
								<div className="space-y-4">
									<div>
										<Label htmlFor="name" className="text-base">Room Name</Label>
										<Input
											id="name"
											name="name"
											value={formData.name}
											onChange={handleRoomChange}
											placeholder="Enter a memorable name for your quiz room"
											className="mt-1.5"
											required
										/>
									</div>
									
									<div>
										<Label htmlFor="description" className="text-base">Description</Label>
										<Textarea
											id="description"
											name="description"
											value={formData.description}
											onChange={handleRoomChange}
											placeholder="Describe what this quiz is about"
											className="mt-1.5 min-h-24"
											required
										/>
									</div>
									
									<div>
										<Label htmlFor="maxParticipants" className="text-base">Max Participants</Label>
										<div className="flex items-center mt-1.5">
											<Input
												id="maxParticipants"
												name="maxParticipants"
												type="number"
												min={1}
												max={50}
												value={formData.maxParticipants}
												onChange={(e) =>
													setFormData({
														...formData,
														maxParticipants: parseInt(e.target.value),
													})
												}
												className="max-w-[120px]"
												required
											/>
											<Users className="ml-3 text-muted-foreground" size={18} />
											<span className="ml-2 text-sm text-muted-foreground">
												Maximum number of participants allowed
											</span>
										</div>
									</div>
								</div>

								<Button 
									type="submit" 
									disabled={isLoading} 
									className="w-full mt-6"
									size="lg"
								>
									{isLoading ? (
										<>
											<Loader2 className="animate-spin w-4 h-4 mr-2" />
											Creating Room...
										</>
									) : (
										<>Create Room</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</>
			) : (
				<>
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-3xl font-bold">Quiz Room Management</h1>
							<p className="text-muted-foreground mt-1">
								Room ID: <span className="font-mono">{roomId}</span>
							</p>
						</div>
						<Button variant="outline" onClick={() => router.push("/multi")}>
							<ArrowLeft className="w-4 h-4 mr-2" /> Back to Lobby
						</Button>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<Card className="lg:col-span-1">
							<CardHeader>
								<CardTitle>Room Info</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<h3 className="font-semibold">{roomData?.name}</h3>
										<p className="text-sm text-muted-foreground mt-1">{roomData?.description}</p>
									</div>
									
									<Separator />
									
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<Users size={16} className="text-muted-foreground" />
											<span className="ml-2 text-sm">
												{roomData?.participants}/{roomData?.maxParticipants} participants
											</span>
										</div>
										<Badge variant={roomQuestions.length > 0 ? "default" : "outline"}>
											{roomQuestions.length} Questions
										</Badge>
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-end">
								<Button 
									variant="default" 
									onClick={() => router.push("/multi")}
									disabled={roomQuestions.length === 0}
									className="w-full"
								>
									{roomQuestions.length === 0 ? (
										"Add questions first"
									) : (
										"Finish and Go to Lobby"
									)}
								</Button>
							</CardFooter>
						</Card>

						<div className="lg:col-span-2">
							<Tabs defaultValue="create" onValueChange={setActiveTab} className="w-full">
								<TabsList className="grid grid-cols-2 mb-6">
									<TabsTrigger value="create">Add Question</TabsTrigger>
									<TabsTrigger value="view">View Questions ({roomQuestions.length})</TabsTrigger>
								</TabsList>
								
								<TabsContent value="create">
									<Card>
										<CardHeader>
											<CardTitle>Create New Question</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												<div>
													<Label htmlFor="question" className="text-base">Question</Label>
													<Textarea
														id="question"
														value={question}
														onChange={(e) => setQuestion(e.target.value)}
														placeholder="Enter your question"
														className="mt-1.5 min-h-24"
													/>
												</div>

												<div className="space-y-3">
													<Label className="text-base">Answer Options</Label>
													{choices.map((choice, index) => (
														<div key={index} className="flex items-center gap-3">
															<div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-medium">
																{String.fromCharCode(65 + index)}
															</div>
															<Input
																value={choice}
																onChange={(e) => handleOptionChange(e.target.value, index)}
																placeholder={`Option ${index + 1}`}
																className="flex-1"
															/>
															<div className="flex items-center gap-2">
																<input
																	type="radio"
																	name="correct"
																	id={`correct-${index}`}
																	checked={correctIndex === index}
																	onChange={() => setCorrectIndex(index)}
																	className="accent-green-500 w-4 h-4"
																/>
																<Label htmlFor={`correct-${index}`} className="text-sm cursor-pointer">
																	Correct
																</Label>
															</div>
														</div>
													))}
												</div>

												<div>
													<Label htmlFor="time" className="text-base">Time Limit (seconds)</Label>
													<div className="flex items-center mt-1.5">
														<Input
															id="time"
															type="number"
															min="1"
															max="60"
															value={time}
															onChange={(e) => setTime(e.target.value)}
															className="max-w-[120px]"
														/>
														<Clock className="ml-3 text-muted-foreground" size={18} />
														<span className="ml-2 text-sm text-muted-foreground">
															Seconds to answer this question
														</span>
													</div>
												</div>
											</div>
										</CardContent>
										<CardFooter>
											<Button
												className="w-full"
												onClick={handleQuestionSubmit}
												disabled={loadingQuestion}
											>
												{loadingQuestion ? (
													<>
														<Loader2 className="animate-spin w-4 h-4 mr-2" />
														Adding Question...
													</>
												) : (
													<>
														<PlusCircle className="w-4 h-4 mr-2" />
														Add Question
													</>
												)}
											</Button>
										</CardFooter>
									</Card>
								</TabsContent>
								
								<TabsContent value="view">
									{roomQuestions.length === 0 ? (
										<Card>
											<CardContent className="flex flex-col items-center justify-center py-12">
												<AlertCircle className="text-muted-foreground mb-4" size={48} />
												<h3 className="text-xl font-medium mb-2">No Questions Yet</h3>
												<p className="text-muted-foreground text-center max-w-md">
													You haven't added any questions to this room. Switch to the "Add Question" tab to create your first question.
												</p>
												<Button 
													variant="outline" 
													className="mt-6"
													onClick={() => setActiveTab("create")}
												>
													<PlusCircle className="w-4 h-4 mr-2" />
													Create First Question
												</Button>
											</CardContent>
										</Card>
									) : (
										<div className="space-y-4">
											{roomQuestions.map((q, idx) => (
												<Card key={q.id}>
													<CardContent className="pt-6">
														<div className="flex justify-between items-start mb-4">
															<div className="flex items-center">
																<Badge variant="outline" className="mr-2">Q{idx + 1}</Badge>
																<h3 className="font-medium text-lg">{q.question}</h3>
															</div>
															<Badge variant="secondary">
																<Clock className="w-3 h-3 mr-1" />
																{q.time}s
															</Badge>
														</div>
														
														<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
															<div className={`p-3 rounded-md border ${
																q.correctAnswer === q.choices1 ? "bg-green-50 border-green-200" : "bg-gray-50"
															}`}>
																<div className="flex items-center">
																	<div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-medium text-sm mr-2">
																		A
																	</div>
																	<span>{q.choices1}</span>
																	{q.correctAnswer === q.choices1 && (
																		<CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
																	)}
																</div>
															</div>
															<div className={`p-3 rounded-md border ${
																q.correctAnswer === q.choices2 ? "bg-green-50 border-green-200" : "bg-gray-50"
															}`}>
																<div className="flex items-center">
																	<div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-medium text-sm mr-2">
																		B
																	</div>
																	<span>{q.choices2}</span>
																	{q.correctAnswer === q.choices2 && (
																		<CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
																	)}
																</div>
															</div>
															<div className={`p-3 rounded-md border ${
																q.correctAnswer === q.choices3 ? "bg-green-50 border-green-200" : "bg-gray-50"
															}`}>
																<div className="flex items-center">
																	<div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-medium text-sm mr-2">
																		C
																	</div>
																	<span>{q.choices3}</span>
																	{q.correctAnswer === q.choices3 && (
																		<CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
																	)}
																</div>
															</div>
															<div className={`p-3 rounded-md border ${
																q.correctAnswer === q.choices4 ? "bg-green-50 border-green-200" : "bg-gray-50"
															}`}>
																<div className="flex items-center">
																	<div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-medium text-sm mr-2">
																		D
																	</div>
																	<span>{q.choices4}</span>
																	{q.correctAnswer === q.choices4 && (
																		<CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
																	)}
																</div>
															</div>
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									)}
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
