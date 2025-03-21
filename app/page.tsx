import Link from "next/link";
import {
	TwitterIcon as TikTok,
	Youtube,
	Facebook,
	Linkedin,
	Instagram,
	Home,
	BookOpen,
	Calendar,
	Users,
	LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/dot-bg";
import { Navigation } from "@/components/bottom-nav";

export default function LandingPage() {
	return (
		<div className="min-h-screen w-full bg-white relative overflow-hidden font-[family-name:var(--font-geist-sans)]">
			<DotPattern
				className={cn(
					"[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
				)}
			/>

			{/* Decorative Squares */}
			<div className="absolute top-[20%] left-[40%] w-16 h-16 bg-gray-100 opacity-50 rounded-sm"></div>
			<div className="absolute top-[15%] right-[20%] w-12 h-12 bg-gray-100 opacity-50 rounded-sm"></div>
			<div className="absolute bottom-[20%] left-[15%] w-14 h-14 bg-gray-100 opacity-50 rounded-sm"></div>
			<div className="absolute bottom-[15%] right-[15%] w-10 h-10 bg-gray-100 opacity-50 rounded-sm"></div>

			{/* Main Content */}
			<main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
				<div
					className="max-w-3xl w-full text-center space-y-6"
					style={{ color: "rgb(25 58 111)" }}
				>
					<p className="text-gray-600 text-lg">THE</p>

					<h1 className="text-6xl md:text-8xl font-black tracking-tight">
						MR MED
					</h1>

					<p className="text-gray-600 text-lg md:text-xl">
						Lorem ipsum, dolor sit amet consectetur adipisicing elit.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 font-[family-name:var(--font-geist-mono)]">
						<Link
							href="/learn"
							className="text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
							style={{ backgroundColor: "rgb(255, 156, 83)" }}
						>
							Start Learning
						</Link>
						<Link
							href="/signin"
							className="bg-white text-black px-8 py-3 rounded-full font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
							style={{ color: "rgb(25 58 111)" }}
						>
							Sign Up
						</Link>
					</div>

					{/* Social Icons */}
					<div className="flex justify-center gap-6 pt-8">
						<Link
							href="#"
							className="text-gray-500 hover:text-gray-800 transition-colors"
						>
							<TikTok className="w-5 h-5" />
							<span className="sr-only">TikTok</span>
						</Link>
						<Link
							href="#"
							className="text-gray-500 hover:text-gray-800 transition-colors"
						>
							<Youtube className="w-5 h-5" />
							<span className="sr-only">YouTube</span>
						</Link>
						<Link
							href="#"
							className="text-gray-500 hover:text-gray-800 transition-colors"
						>
							<Facebook className="w-5 h-5" />
							<span className="sr-only">Facebook</span>
						</Link>
						<Link
							href="#"
							className="text-gray-500 hover:text-gray-800 transition-colors"
						>
							<Linkedin className="w-5 h-5" />
							<span className="sr-only">LinkedIn</span>
						</Link>
						<Link
							href="#"
							className="text-gray-500 hover:text-gray-800 transition-colors"
						>
							<Instagram className="w-5 h-5" />
							<span className="sr-only">Instagram</span>
						</Link>
					</div>
				</div>

				{/* Navigation */}
				<div className="absolute bottom-8 left-0 right-0 flex justify-center">
					<Navigation />
				</div>
			</main>
		</div>
	);
}
