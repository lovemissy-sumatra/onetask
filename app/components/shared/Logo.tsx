type LogoHeaderT = {
    context?: string;
}
export function LogoHeader({ context }: LogoHeaderT) {
    return (<div className="text-center mb-8">
        <a href="/">
            <h1 className="font-bold text-4xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 inline-block text-transparent bg-clip-text pb-3">
                PrintAway
            </h1>
        </a>
        {context && <p className="text-neutral-400 mt-2">{context}</p>}

    </div>)
}