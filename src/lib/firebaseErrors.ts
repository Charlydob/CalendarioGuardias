import { FirebaseError } from 'firebase/app'

export function friendlyFirebaseError(error: unknown) {
  const code = error instanceof FirebaseError ? error.code : ''
  if (code === 'auth/operation-not-allowed') return 'Firebase Auth todavía no está habilitado. Puedes continuar temporalmente sin cuenta.'
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') return 'El email o la contraseña no son correctos.'
  if (code === 'auth/email-already-in-use') return 'Ya existe una cuenta con ese email.'
  if (code === 'auth/weak-password') return 'La contraseña es demasiado débil. Usa al menos 6 caracteres.'
  if (code.includes('network-request-failed') || code.includes('unavailable')) return 'No se pudo conectar con Firebase. Comprueba tu conexión o usa el modo temporal.'
  if (code.includes('permission-denied') || code.includes('permission_denied')) return 'Firebase no permite acceder a estos datos. Puedes cerrar sesión y usar el modo temporal.'
  return 'No se pudo completar la operación con Firebase. La aplicación sigue disponible en modo temporal.'
}
