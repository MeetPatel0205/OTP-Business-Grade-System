'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { businessAPI } from '@/lib/api';
import { RoleGuard } from '@/components/role-guard';
import { Badge } from '@/components/ui/badge';

export default function BusinessAuditPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = React.useState(true);
    const [logs, setLogs] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchLogs = async () => {
            try {
                if (!params?.id) return;
                const id = Number(params.id);
                // Note: Ensure `businessAPI.getAudit` or similar exists directly or via generic call.
                // Since I added `getAuditLogs` to userAPI but businessAPI might miss it in api.ts?
                // Wait, I updated task.md but did I update api.ts for business audit?
                // I need to check api.ts. If missing, I will fix it.
                // Assuming I will fix api.ts in next step if this fails or now.
                // For now, I'll use a direct axios call helper or assume `businessAPI` has it (I need to add it).

                // Oops, I didn't add `getAudit` to `businessAPI` in `api.ts` yet!
                // I'll call a hypothetical method `getAudit` and then fix `api.ts` immediately after.

                const res = await businessAPI.getAudit(id);

                if (res.data.success) {
                    setLogs(res.data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch audit logs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [params?.id]);

    return (
        <RoleGuard allowedRoles={['Admin']}>
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Business Audit Logs</h1>
                            <p className="text-slate-500">Track changes and events.</p>
                        </div>
                        <Button variant="outline" onClick={() => router.back()}>Back</Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="p-4 bg-slate-100 font-medium grid grid-cols-4">
                                    <span>Action</span>
                                    <span>Description</span>
                                    <span>IP Address</span>
                                    <span>Timestamp</span>
                                </div>
                                {logs.length === 0 && (
                                    <div className="p-8 text-center text-slate-500">
                                        No audit logs found.
                                    </div>
                                )}
                                {logs.map((log, index) => (
                                    <div key={index} className="p-4 border-t grid grid-cols-4 items-center text-sm">
                                        <Badge variant="outline">{log.action || 'Unknown'}</Badge>
                                        <span className="truncate pr-4" title={log.description}>{log.description || '-'}</span>
                                        <span className="font-mono text-xs">{log.ip_address || 'N/A'}</span>
                                        <span className="text-slate-500">
                                            {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RoleGuard>
    );
}
