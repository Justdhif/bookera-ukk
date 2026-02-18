<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user || !$this->hasRole($user->role, $roles)) {
            return response()->json([
                'message' => 'Forbidden',
                'error' => 'You do not have permission to access this resource'
            ], 403);
        }

        return $next($request);
    }

    protected function hasRole(string $userRole, array $allowedRoles): bool
    {
        foreach ($allowedRoles as $allowedRole) {
            if ($userRole === $allowedRole) {
                return true;
            }

            if (str_ends_with($allowedRole, ':*')) {
                $prefix = substr($allowedRole, 0, -1);
                if (str_starts_with($userRole, $prefix)) {
                    return true;
                }
            }
        }

        return false;
    }
}
