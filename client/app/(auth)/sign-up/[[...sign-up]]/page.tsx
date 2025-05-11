import { SignUp } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='relative min-h-screen w-full'>
            <video
                autoPlay
                muted
                loop
                className="fixed top-0 left-0 w-full h-full object-cover -z-10"
            >
                <source src="/login.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="flex min-h-screen w-full items-center justify-center pt-16 bg-black/50">
                <div className="w-full max-w-md rounded-xl bg-white/10 p-8 backdrop-blur-lg my-4">
                    <SignUp
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "bg-black shadow-none w-full",
                                headerTitle: "text-2xl font-bold text-white",
                                headerSubtitle: "text-gray-200",
                                socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 text-white border-white/20",
                                dividerLine: "bg-white/20",
                                dividerText: "text-white",
                                formFieldLabel: "text-white",
                                formFieldInput: "bg-white/10 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500",
                                formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
                                footerActionText: "text-white",
                                footerActionLink: "text-purple-300 hover:text-purple-200",
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
