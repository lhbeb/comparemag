import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900">Privacy Policy</h1>
          <div className="prose prose-blue prose-lg max-w-none text-slate-700">
            <p className="lead text-xl text-slate-600 mb-8 border-l-4 border-blue-600 pl-4">
              At Compareradar.com, we are committed to protecting your privacy and ensuring your data is handled securely.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Information We Collect</h2>
            <p className="mb-6">
              When you use our website, we may collect anonymous usage data to improve our editorial content and overall user experience. If you subscribe to our newsletter, we collect your email address securely.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">How We Use Your Data</h2>
            <p className="mb-6">
              Your information is used strictly to provide you with the services you requested, such as delivering our newsletter or optimizing our website's performance. We never sell your personal information to third parties.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Cookies and Tracking</h2>
            <p className="mb-6">
              We use standard cookies to maintain session states and analyze traffic. You can disable cookies through your browser settings without losing access to our core content.
            </p>
            <p className="mt-12 text-sm text-slate-500">Last Updated: {new Date().getFullYear()}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
