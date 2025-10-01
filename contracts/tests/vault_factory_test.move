module vault_factory::vault_factory_test {
    use vault_factory::VaultFactory;
    use std::signer;

    #[test(account = @0x1, user = @0x2)]
    fun test_create_and_join_and_leave(account: signer, user: signer) {
        // 1. Leader creates vault
        VaultFactory::create_vault(&account);

        // 2. User joins the vault
        VaultFactory::join_vault(&user, signer::address_of(&account));

        // 3. User leaves the vault
        VaultFactory::leave_vault(&user, signer::address_of(&account));
    }

    #[test(account = @0x1)]
    fun test_publish_signal(account: signer) {
        // Leader creates vault
        VaultFactory::create_vault(&account);

        // Leader publishes two signals
        VaultFactory::publish_signal(&account, 42);
        VaultFactory::publish_signal(&account, 99);
    }

    #[test(account = @0x1)]
    fun test_emergency_pause(account: signer) {
        // Leader creates vault
        VaultFactory::create_vault(&account);

        // Emergency: leader pauses vault
        VaultFactory::emergency_pause(&account);
    }
}
