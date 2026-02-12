import Image from "next/image";
import Logo from "../../public/logo.png";

export default function LoadingPage() {
    return (
        <div className="flex mt-32 text-2xl flex-col items-center justify-center space-y-3">
            <Image src={Logo} alt="logo" className="bg-black" />
            <p>Loading...</p>
        </div>
    );
}