import { NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import { redirectKeepingCookies } from './redirectKeepingCookies';

describe('redirectKeepingCookies', () => {
  it('carries refreshed session cookies onto the redirect', () => {
    const refreshed = NextResponse.next();
    refreshed.cookies.set('sb-auth-token', 'rotated', { httpOnly: true });
    const res = redirectKeepingCookies(refreshed, 'http://localhost/kid');
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/kid');
    expect(res.cookies.get('sb-auth-token')?.value).toBe('rotated');
  });
});
