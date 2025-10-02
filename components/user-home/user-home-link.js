import Link from "next/link"

// Creates Links for routes on user-home
export default function UserHomeLink({name, path}) {
    return (
    <Link
        href={`/${path}`}
        className="block no-underline bg-gray-800 text-white font-medium hover:bg-gray-700 hover:shadow-md transition p-3 rounded-md"
    >
        {name}
    </Link>
    );
}