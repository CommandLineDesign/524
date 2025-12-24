import { colors } from './colors';

export const shadows = {
  sm: {
    shadowColor: colors.subtle,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: colors.subtle,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.subtle,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  xl: {
    shadowColor: colors.subtle,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
};
