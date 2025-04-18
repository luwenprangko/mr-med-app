"use client";

import React from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Activity, Cuboid, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Room {
	id: number;
	name: string;
	description: string;
	maxParticipants: number;
	participants: number;
}

export default function EmergencySimulation() {
	const queryClient = useQueryClient();

	const {
		data: rooms,
		isLoading,
		error,
	} = useQuery<Room[]>({
		queryKey: ["rooms"],
		queryFn: async () => {
			const res = await axios.get("http://localhost:3001/rooms");
			return res.data;
		},
	});

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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rooms"] });
		},
	});

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

	if (isLoading)
		return (
			<div className="flex flex-col items-center justify-center h-screen">
				<Loader2 className="animate-spin" size={48} />
				<span className="mt-4 text-xl">Loading...</span>
			</div>
		);
	if (error) return <div>Error loading rooms</div>;

	return (
		<div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Delivery Room Simulation</h1>
				<p className="text-muted-foreground">
					Real-Life Simulations, Limitless Learning 🚀
				</p>
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
							<div className="text-muted-foreground text-sm">Active Rooms</div>
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
							<div className="text-muted-foreground text-sm">Online Users</div>
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
										<p className="text-muted-foreground">{room.description}</p>
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
