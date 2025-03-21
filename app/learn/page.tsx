import Link from "next/link";
import { Navigation } from "@/components/bottom-nav";

export default function LearnPage() {
	return (
		<div className="min-h-screen w-full bg-white relative overflow-hidden">
			{/* Grid Background */}
			<div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-4 opacity-10 pointer-events-none">
				{Array.from({ length: 144 }).map((_, i) => (
					<div key={i} className="border border-gray-200"></div>
				))}
			</div>

			{/* Main Content */}
			<main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
				<div className="max-w-3xl w-full text-center space-y-6">
					<h1 className="text-5xl md:text-6xl font-black tracking-tight">
						Learning Resources
					</h1>

					<p className="text-gray-600 text-lg md:text-xl">
						Explore our comprehensive learning materials for Internet of
						Everything.
					</p>

					<div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-white p-6 rounded-sm shadow-md text-left border-1">
							<h2 className="text-xl font-bold mb-2">Single Player</h2>
							<p className="text-gray-600 mb-4">
								Lorem, ipsum dolor sit amet consectetur adipisicing elit.
							</p>
							<Link href="#" className="text-black font-medium hover:underline">
								Explore guides →
							</Link>
						</div>

						<div className="bg-white p-6 rounded-sm shadow-md text-left border-1">
							<h2 className="text-xl font-bold mb-2">Multiplayer</h2>
							<p className="text-gray-600 mb-4">
								Lorem, ipsum dolor sit amet consectetur adipisicing elit.
							</p>
							<Link href="#" className="text-black font-medium hover:underline">
								Play →
							</Link>
						</div>
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
