from django.contrib.auth.hashers import BasePasswordHasher
from django.utils.crypto import constant_time_compare

class PlainTextPasswordHasher(BasePasswordHasher):
    """
    WARNING: This hasher stores passwords in PLAIN TEXT. 
    This is extremely insecure and should only be used if explicitly required 
    for specific non-production use cases.
    
    Format in DB: plain$$password_content
    """
    algorithm = "plain"

    def salt(self):
        return ""

    def encode(self, password, salt):
        # We don't use salt, just return the algorithm and password
        return f"{self.algorithm}$${password}"

    def verify(self, password, encoded):
        # Extract the password from the encoded string (plain$$password)
        try:
            algorithm, salt, hash_pw = encoded.split('$', 2)
        except ValueError:
            return False
            
        return constant_time_compare(password, hash_pw)

    def safe_summary(self, encoded):
        return {
            "algorithm": self.algorithm,
            "hash": encoded,
        }

    def harden_runtime(self, password, encoded):
        pass
