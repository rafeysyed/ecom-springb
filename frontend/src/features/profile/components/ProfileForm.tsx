import { Card } from '@/components/ui/Card';

/**
 * Placeholder for editing profile details. The current API only exposes
 * GET /internal/users/{id} — there's no update endpoint yet, so this
 * component intentionally does not render a functional form. Once a
 * PATCH/PUT /internal/users/{id} endpoint exists, this is where the edit
 * form (with its own useUpdateProfile mutation hook) belongs.
 */
export function ProfileForm() {
    return (
        <Card padding="lg">
            <p className="text-sm text-text-muted">
                Profile editing isn&apos;t available yet — check back soon.
            </p>
        </Card>
    );
}