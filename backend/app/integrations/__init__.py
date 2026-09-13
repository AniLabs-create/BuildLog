"""Developer platform integrations.

Importing this package registers every built-in provider into the shared
registry (base.registry), so routes can do registry.get("github") etc.
"""
from app.integrations.github.integration import github_integration  # noqa: F401
from app.integrations.leetcode.integration import leetcode_integration  # noqa: F401
