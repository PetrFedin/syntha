import { SYNTH_MOCK_KNOWN_PASSWORD } from '@/lib/auth/dev-auth-bootstrap';

export const calculateTabCounts = (activity: any, preOrders: any[] = []) => {
  return {
    looks: activity.lookboardsCount,
    wardrobe: activity.wishlistCount,
    preorders: preOrders.length,
    comparisons: 0,
    achievements: 0,
    payments: activity.loyaltyPoints,
  };
};

export const handleAutoLogin = async (loading: boolean, user: any, signIn: any) => {
  if (!loading && !user) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('syntha_auth_user');
      }
      await signIn('elena.petrova@example.com', SYNTH_MOCK_KNOWN_PASSWORD);
    } catch (error) {
      console.error('Auto-login failed:', error);
      setTimeout(() => {
        signIn('elena.petrova@example.com', SYNTH_MOCK_KNOWN_PASSWORD).catch(console.error);
      }, 1000);
    }
  } else if (user && user.email !== 'elena.petrova@example.com') {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('syntha_auth_user');
      }
      await signIn('elena.petrova@example.com', SYNTH_MOCK_KNOWN_PASSWORD);
    } catch (error) {
      console.error('Switch user failed:', error);
    }
  }
};
