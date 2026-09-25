USE bppmhkp;
UPDATE users SET role = CASE 
  WHEN email LIKE '%admin%' THEN 'admin'
  WHEN email LIKE '%pimpinan%' OR nama LIKE '%Pimpinan%' THEN 'eksekutif'
  WHEN email LIKE '%pembina%' THEN 'pembina'
  ELSE 'dalwas'
END;
SELECT id, nama, email, role FROM users;
