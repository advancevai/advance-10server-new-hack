import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

export const serviceAccount = {
  type: 'service_account',
  project_id: 'new-da88b',
  private_key_id: '5c760fca5ef99394ab36ea7865a74770b53d5394',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyNRZ28N27lnMH\nKyXcejgSeZ93WLL9TAkf0SgZhBGdAFHvcUxVaYFUkBEhAtXBWNkx2jWorLa51H1D\ndQZsSJrvWQaIwnYJ1sVT3LboAIgWfQGE+RqVQq6MLP+0Vjgc/vof7tmmKL4mSOPg\n1ssB/GQ9zRzj34y3Yz7RP97AeIvg9rFFH23KBiaEPhZF/rwIAMm7aFjAe+uEloMi\nLeDvkdtjy/aDfcDIqeXsulQbMpPwEtW6jZZlwQEW3NN6x8k6apnnYa/dzPQmXljw\nrPGNhiqxPfPIVJUWrLbaEqK6R4n7mJM+2bOky6k6oDkX/KJhdtnm4O45hybxgrpf\nsc3QXMKpAgMBAAECggEAM00yHuJ/SpnomlczCpIKo1Ls88wOlvm1JLovC41oDqUB\ncWdR3MLHLwNcUv8Aby03NXFGgjzaS4ve1bUSOMj8BUxBI8yrc3CnFNnUs9w3URYC\ngne9zdtI6WSo5g7uD3bdpaS6dmmDN/1C0L606WjxqJLsLrNzzHVfJ5j19L2fMw8F\n9Zcs1ohMfMNieN4tPIs4DzFRn05kOzxZ4rXGz3I3SaqgGhV8jwMXgTovokTkEkog\nYw0ppWogM6HaEKkN6HrL4y5JjiF5tm4AIt06Y9HPs8XYX+i+CdjlCAuf11UklcTo\nbxIRdxHI2TXp9f5b+WUSYQMA3nNlu6upF42ekTYfUwKBgQDrEHVJa7SA8DhLzOXV\njW41C7u7GzmDuG22xWH/nce1STFMl5+p7DxwIzD/Rj0B1UlP30+Nt1vVFnzjkKcW\n9YJACvIjVlUXyHFMR5691kE4H+xoO1FTaVIw0Qv6haZfUzNHCZts0UbSEgzYD3vW\nXkyK2ggp011sbooJfdcu+4lR7wKBgQDCFEYGI/9WOciXZw/gICD8f0uq6hMTgUcP\n9mi84Hlv5pFwoU32xvBhb6jQOqwd8c5Z3rjbqH0uQdg116UkhtR3qLHWU073RM6L\nnuvXgAppFA/uGyISkHWTN+elhrqp+GmOPDKGgPmjD29+UQE94w9x+AwKE553mFSe\nFhQK/E1s5wKBgFSceftRn4mB7mGqgVhbLj492PdCl3NIYYWWiu3dt1MT44D0Wu5p\nMGAU6sAYYkFUqqzrbtFOHOoYzB+Fo/9po9a1me8KVlrXNaEFbqhahONU6l2ibGWf\n1Yvo02z7yqUpZ528YYvL0Lgw8xqaiDLjgp3AWYvknw42w80i1N/+frFVAoGBAIST\nFMJdFK7yCfRikpWnXOEek7HM8/r+9GwTBrj/HfUyq2ckyP0qKEpm3ApiCfDqnOsH\nGX/zOI/AqtEc3dJ1x+11bwXZIrgGaJE3niM3c+UTr04Xes7zn11Rcwu/XQN+jZx7\nwofe0qhwgtjmvNJpqMNRjefUPwuzIxpaOpbGgp1BAoGAaSwxz+B1wl6wl3Crx9Mq\nA17j1TYfEcWYoPoWDNVyvVzWgJ7vbHOBBNIqJUS9sqThJ/IGf8qVbOmGqIE4W2Ts\nfwiEaW3NTBTViZd4ibZgLiVJrFmgQWYqlMf0t4q4BQ0sbkSxIwoMYkv7QujcgBy3\n79SEzF+6GA8IBOcODihCmao=\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-fbsvc@new-da88b.iam.gserviceaccount.com',
  client_id: '107604942762767085095',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40new-da88b.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount as any),
      databaseURL: 'https://new-da88b-default-rtdb.firebaseio.com',
    });

export const adminDb = getDatabase(adminApp);
