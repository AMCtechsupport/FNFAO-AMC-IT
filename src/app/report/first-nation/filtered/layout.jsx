import { Suspense } from "react";

/*
The reason we have this layout to wrap the page in suspense is to remove an error that
prevents us from running `npm run build`.
*/
export default function ClientFilterPageLayout({children}) {
    return (
        <Suspense fallback={
            <div className="flex mt-32 text-2xl justify-center animate-pulse">
                <p>Fetching Clients...</p>
            </div>
        }>
            {children}
        </Suspense>

    );
}