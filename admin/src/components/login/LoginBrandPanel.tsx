import { Sparkles } from 'lucide-react';

export function LoginBrandPanel() {
    return (
        <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                }}
            ></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center px-16 py-12 text-white">
                {/* Icon */}
                <div className="mb-8 inline-flex">
                    <div className="relative">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform rotate-12 transition-transform hover:rotate-0 duration-300">
                            <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-5xl font-bold mb-4 leading-tight">
                    Hello<br />
                    Workit!
                </h1>

                {/* Description */}
                <p className="text-lg text-white/90 leading-relaxed max-w-md">
                    Streamlining Workit e-commerce operations with powerful admin tools.
                    Track sales, manage inventory, and analyze performance through automation
                    and track tons of data!
                </p>

                {/* Footer */}
                <div className="mt-auto pt-12">
                    <p className="text-white/70 text-sm">
                        © {new Date().getFullYear()} Workit. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
