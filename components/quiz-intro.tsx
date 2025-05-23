"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Users, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface User {
	id: string;
	name: string;
	score?: number;
}

interface QuizIntroProps {
	roomName: string;
	roomDescription: string;
	participants: number;
	maxParticipants: number;
	users: User[];
	leaderboard?: User[];
	onStartQuiz: () => void;
}

export function QuizIntro({
	roomName,
	roomDescription,
	participants,
	maxParticipants,
	users,
	leaderboard = [],
	onStartQuiz,
}: QuizIntroProps) {
	return (
		<div className="w-full max-w-[800px] mx-auto space-y-6">
			{/* Room Header */}
			<Card className="border shadow-sm">
				<CardHeader className="pb-2">
					<CardTitle className="text-2xl font-bold">{roomName}</CardTitle>
					<p className="text-muted-foreground">{roomDescription}</p>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">
								{participants}/{maxParticipants} participants
							</span>
						</div>
						<Button
							onClick={onStartQuiz}
							className="bg-gray-900 text-white hover:bg-gray-800 gap-2"
						>
							<Play className="h-4 w-4" />
							Start Quiz
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Participants List */}
				<Card className="border shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="text-xl font-semibold flex items-center gap-2">
							<Users className="h-5 w-5 text-blue-600" />
							Participants
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{users.length === 0 ? (
								<p className="text-muted-foreground text-center py-4">
									No participants yet
								</p>
							) : (
								users.map((user) => (
									<div key={user.id} className="flex items-center gap-3">
										<Avatar className="border-2 border-white">
											<AvatarFallback>
												{user.name.substring(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<span>{user.name}</span>
										<Badge className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-100">
											Ready
										</Badge>
									</div>
								))
							)}
						</div>
					</CardContent>
				</Card>

				{/* Leaderboard */}
				<Card className="border shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="text-xl font-semibold flex items-center gap-2">
							<Trophy className="h-5 w-5 text-yellow-600" />
							Leaderboard
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{leaderboard.length === 0 ? (
								<p className="text-muted-foreground text-center py-4">
									No scores yet
								</p>
							) : (
								leaderboard
									.sort((a, b) => (b.score || 0) - (a.score || 0))
									.slice(0, 5)
									.map((user, index) => (
										<div key={user.id} className="flex items-center gap-3">
											<div className="w-6 text-center font-semibold">
												{index + 1}
											</div>
											<Avatar className="border-2 border-white">
												<AvatarFallback>
													{user.name.substring(0, 2).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<span>{user.name}</span>
											<span className="ml-auto font-semibold">
												{user.score}
											</span>
										</div>
									))
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
