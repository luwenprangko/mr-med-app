"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import QuizPage from "@/app/quiz/quiz";

export default function Page() {
	const [started, setStarted] = useState(false);
	const [countdown, setCountdown] = useState<number | null>(null);

	useEffect(() => {
		if (started && countdown !== null) {
			if (countdown > 0) {
				const timer = setTimeout(() => {
					setCountdown(countdown - 1);
				}, 1000);
				return () => clearTimeout(timer);
			}
		}
	}, [started, countdown]);

	const handleStart = () => {
		setStarted(true);
		setCountdown(3);
	};

	if (!started) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white">
				<div className="text-center space-y-6 max-w-md mx-auto">
					<h1 className="text-4xl font-bold tracking-tight">Quiz Challenge</h1>
					<p className="text-muted-foreground text-lg">
						Test your knowledge with our timed quiz. Answer correctly and
						quickly for the highest score!
					</p>
					<Button size="lg" onClick={handleStart} className="px-8 py-6 text-lg">
						Start Quiz
					</Button>
				</div>
			</div>
		);
	}

	if (countdown && countdown > 0) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="text-8xl font-bold animate-pulse" key={countdown}>
						{countdown}
					</div>
					<p className="text-xl text-muted-foreground mt-4">Get ready...</p>
				</div>
			</div>
		);
	}

	return <QuizPage />;
}
