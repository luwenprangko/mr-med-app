import Link from "next/link";
import { Home, BookOpen, Calendar, Users, LogOut } from "lucide-react";

export function Navigation() {
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="bg-white rounded-md px-6 py-3 flex items-center gap-6 border-1">
				<Link
					href="/"
					className="text-gray-700 hover:text-black transition-colors"
				>
					<Home className="w-5 h-5" />
					<span className="sr-only">Home</span>
				</Link>
				<Link
					href="#"
					className="text-gray-500 hover:text-gray-800 transition-colors"
				>
					<BookOpen className="w-5 h-5" />
					<span className="sr-only">Learn</span>
				</Link>
				<Link
					href="#"
					className="text-gray-500 hover:text-gray-800 transition-colors"
				>
					<Users className="w-5 h-5" />
					<span className="sr-only">Community</span>
				</Link>
			</div>
		</div>
	);
}
