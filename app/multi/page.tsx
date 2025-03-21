"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Activity, Cuboid, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Define the Room interface without the duration field.
interface Room {
	id: number;
	name: string;
	description: string;
	maxParticipants: number;
	participants: number;
}

// Zod schema for validating the new room form (duration removed)
const roomSchema = z.object({
	name: z.string().min(1, "Room name is required"),
	description: z.string().min(1, "Description is required"),
	maxParticipants: z
		.string()
		.regex(/^\d+$/, "Must be a number")
		.transform(Number),
});

type RoomFormData = z.infer<typeof roomSchema>;

export default function EmergencySimulation() {
	const queryClient = useQueryClient();

	// Fetch rooms from the JSON server
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

	// Mutation for adding a new room. "participants" is automatically set to 0.
	const addRoomMutation = useMutation({
		mutationFn: async (newRoom: RoomFormData) => {
			const res = await axios.post("http://localhost:3001/rooms", {
				...newRoom,
				participants: 0,
			});
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rooms"] });
		},
	});

	// Mutation for "joining" a session (increment participants)
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

	// Set up React Hook Form with Zod validation
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<RoomFormData>({
		resolver: zodResolver(roomSchema),
	});

	const onSubmit = (data: RoomFormData) => {
		addRoomMutation.mutate(data);
		reset();
	};

	// Compute summary statistics
	const activeRooms = rooms
		? rooms.filter((room) => room.participants < room.maxParticipants).length
		: 0;
	const onlineUsers = rooms
		? rooms.reduce((sum, room) => sum + room.participants, 0)
		: 0;

	// Compute the badge status based on the participants count and maxParticipants.
	const getBadgeStatus = (room: Room) => {
		if (room.participants >= room.maxParticipants) return "Full";
		if (room.participants / room.maxParticipants >= 0.7) return "Busy";
		return "Open";
	};

	// Map badge status to background color.
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
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-center mb-8">
				<div className="mb-4 sm:mb-0">
					<h1 className="text-3xl font-bold mb-2">Delivery Room Simulation</h1>
					<p className="text-muted-foreground">
						Real-Life Simulations, Limitless Learning.
					</p>
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<Button className="bg-blue-600 hover:bg-blue-700">
							Add New Room
						</Button>
					</DialogTrigger>
					<DialogContent className="w-full max-w-md">
						<DialogHeader>
							<DialogTitle>Add New Room</DialogTitle>
							<DialogDescription>Fill out the details below.</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div>
								<Label>Room Name</Label>
								<Input {...register("name")} placeholder="Enter room name" />
								{errors.name && (
									<p className="text-red-500 text-sm">{errors.name.message}</p>
								)}
							</div>
							<div>
								<Label>Description</Label>
								<Textarea
									{...register("description")}
									placeholder="Enter room description"
								/>
								{errors.description && (
									<p className="text-red-500 text-sm">
										{errors.description.message}
									</p>
								)}
							</div>
							<div>
								<Label>Max Participants</Label>
								<Input {...register("maxParticipants")} placeholder="0" />
								{errors.maxParticipants && (
									<p className="text-red-500 text-sm">
										{errors.maxParticipants.message}
									</p>
								)}
							</div>
							<DialogFooter>
								<Button
									type="submit"
									className="bg-green-600 hover:bg-green-700"
								>
									Submit
								</Button>
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
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

			{/* Horizontal rule with centered text */}
			<div className="flex items-center my-8">
				<div className="flex-grow border-t border-gray-300"></div>
				<span className="mx-4 text-gray-500 uppercase tracking-widest">
					Rooms
				</span>
				<div className="flex-grow border-t border-gray-300"></div>
			</div>

			{/* Room Cards */}
			<div className="space-y-4">
				{!rooms || rooms.length === 0 ? (
					<div className="flex justify-center items-center h-32">
						<p className="text-gray-500">Empty Room</p>
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
									{/* Badge visible on desktop */}
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
										{/* Badge visible on mobile, placed beside participants */}
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
