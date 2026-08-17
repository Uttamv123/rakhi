import React from 'react';
import { isAwsConfigured, awsConfig } from '../../aws-config';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export default function AdminSettings() {
  const checks = [
    { label: 'AWS Configured', ok: isAwsConfigured },
    { label: 'Cognito User Pool', ok: !!awsConfig.userPoolId },
    { label: 'Cognito Client ID', ok: !!awsConfig.userPoolClientId },
    { label: 'Identity Pool', ok: !!awsConfig.identityPoolId },
    { label: 'DynamoDB Table', ok: !!awsConfig.dynamoTableName },
    { label: 'API Base URL', ok: !!(import.meta as any).env?.VITE_API_BASE_URL },
    { label: 'Razorpay Key', ok: !!(import.meta as any).env?.VITE_RAZORPAY_KEY_ID },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">System configuration status</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-semibold text-sm border-b border-gray-800 pb-3">AWS / Service Configuration</h3>
        {checks.map(({ label, ok }) => (
          <div key={label} className="flex items-center justify-between py-1">
            <span className="text-gray-400 text-sm">{label}</span>
            {ok
              ? <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold"><CheckCircle className="w-4 h-4" /> Configured</span>
              : <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><XCircle className="w-4 h-4" /> Missing</span>
            }
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-semibold text-sm border-b border-gray-800 pb-3">DynamoDB Table</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Table Name</span>
          <span className="text-white font-mono text-sm">{awsConfig.dynamoTableName || '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Region</span>
          <span className="text-white font-mono text-sm">{awsConfig.region || '—'}</span>
        </div>
      </div>

      <div className="bg-amber-950 border border-amber-800 rounded-2xl p-5 flex gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-amber-300 text-sm space-y-1">
          <p className="font-bold">To set up the Admin Cognito group:</p>
          <ol className="list-decimal list-inside space-y-1 text-amber-400 text-xs">
            <li>Open AWS Console → Cognito → User Pools → your pool</li>
            <li>Click "Groups" → Create group named <code className="bg-amber-900 px-1 rounded">Admin</code></li>
            <li>Go to "Users" → find your admin user → click "Add to group" → select Admin</li>
            <li>Sign out and sign back in to refresh the session token</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
