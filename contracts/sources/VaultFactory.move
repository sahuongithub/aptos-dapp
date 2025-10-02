module vault_factory::VaultFactory {
    use std::vector;
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::account;

    // Error codes
    const EVAULT_NOT_FOUND: u64 = 1001;
    const EINSUFFICIENT_BALANCE: u64 = 1002;
    const ENOT_AUTHORIZED: u64 = 1003;
    const EINVALID_AMOUNT: u64 = 1004;
    const EVAULT_PAUSED: u64 = 1005;
    const EUSER_NOT_SUBSCRIBER: u64 = 1006;
    const EUSER_ALREADY_SUBSCRIBER: u64 = 1007;
    const EVAULT_ALREADY_EXISTS: u64 = 1008;

    // Events
    #[event]
    struct VaultCreated has drop, store {
        leader: address,
        timestamp: u64,
    }

    #[event]
    struct UserJoinedVault has drop, store {
        user: address,
        leader: address,
        timestamp: u64,
    }

    #[event]
    struct UserLeftVault has drop, store {
        user: address,
        leader: address,
        timestamp: u64,
    }

    #[event]
    struct SignalPublished has drop, store {
        leader: address,
        signal: u64,
        timestamp: u64,
    }

    #[event]
    struct DepositMade has drop, store {
        user: address,
        leader: address,
        amount: u64,
        timestamp: u64,
    }

    #[event]
    struct WithdrawalMade has drop, store {
        user: address,
        leader: address,
        amount: u64,
        timestamp: u64,
    }

    #[event]
    struct VaultPaused has drop, store {
        leader: address,
        timestamp: u64,
    }

    #[event]
    struct VaultResumed has drop, store {
        leader: address,
        timestamp: u64,
    }

    // The vault resource - includes store ability for account storage
    struct Vault has key, store {
        leader: address,
        subscribers: vector<address>,
        balance: u64,
        signals: vector<u64>,
        paused: bool,
        max_subscribers: u64,
        created_at: u64,
    }

    struct LeaderVault has key, store {
        vault: Vault,
    }

    // Helper function to get current timestamp (mock implementation)
    fun get_current_timestamp(): u64 {
        // In a real implementation, this would get the actual blockchain timestamp
        // For now, using a mock value
        1000000 // Mock timestamp
    }

    // Helper function to check if user is subscriber
    fun is_subscriber(vault: &Vault, user: address): bool {
        vector::contains(&vault.subscribers, &user)
    }

    // Create a new vault (leader only)
    public entry fun create_vault(account: &signer) {
        let leader = signer::address_of(account);
        
        // Check if vault already exists
        assert!(!exists<LeaderVault>(leader), EVAULT_ALREADY_EXISTS);
        
        let vault = Vault {
            leader,
            subscribers: vector::empty<address>(),
            balance: 0,
            signals: vector::empty<u64>(),
            paused: false,
            max_subscribers: 1000, // Set reasonable limit
            created_at: get_current_timestamp(),
        };
        
        move_to(account, LeaderVault { vault });
        
        // Emit event
        event::emit(VaultCreated {
            leader,
            timestamp: get_current_timestamp(),
        });
    }

    // Join vault as subscriber with proper validation
    public entry fun join_vault(account: &signer, leader: address) acquires LeaderVault {
        // Check if vault exists
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        
        let user = signer::address_of(account);
        let store = borrow_global_mut<LeaderVault>(leader);
        
        // Check if vault is paused
        assert!(!store.vault.paused, EVAULT_PAUSED);
        
        // Check if user is already a subscriber
        assert!(!is_subscriber(&store.vault, user), EUSER_ALREADY_SUBSCRIBER);
        
        // Check subscriber limit
        assert!(vector::length(&store.vault.subscribers) < store.vault.max_subscribers, ENOT_AUTHORIZED);
        
        // Add user to subscribers
        vector::push_back(&mut store.vault.subscribers, user);
        
        // Emit event
        event::emit(UserJoinedVault {
            user,
            leader,
            timestamp: get_current_timestamp(),
        });
    }

    // Leave vault as subscriber with improved efficiency
    public entry fun leave_vault(account: &signer, leader: address) acquires LeaderVault {
        // Check if vault exists
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        
        let user = signer::address_of(account);
        let store = borrow_global_mut<LeaderVault>(leader);
        
        // Check if user is a subscriber
        assert!(is_subscriber(&store.vault, user), EUSER_NOT_SUBSCRIBER);
        
        // Find and remove user efficiently
        let subs = &mut store.vault.subscribers;
        let (found, index) = vector::index_of(subs, &user);
        assert!(found, EUSER_NOT_SUBSCRIBER);
        vector::remove(subs, index);
        
        // Emit event
        event::emit(UserLeftVault {
            user,
            leader,
            timestamp: get_current_timestamp(),
        });
    }

    // Leader publishes a trading signal with validation
    public entry fun publish_signal(account: &signer, signal: u64) acquires LeaderVault {
        let leader = signer::address_of(account);
        
        // Check if vault exists
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        
        let store = borrow_global_mut<LeaderVault>(leader);
        
        // Check if vault is paused
        assert!(!store.vault.paused, EVAULT_PAUSED);
        
        // Validate signal (basic validation - signal should not be 0)
        assert!(signal > 0, EINVALID_AMOUNT);
        
        // Add signal
        vector::push_back(&mut store.vault.signals, signal);
        
        // Emit event
        event::emit(SignalPublished {
            leader,
            signal,
            timestamp: get_current_timestamp(),
        });
    }

    // Emergency pause (leader only)
    public entry fun emergency_pause(account: &signer) acquires LeaderVault {
        let leader = signer::address_of(account);
        
        // Check if vault exists
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        
        let store = borrow_global_mut<LeaderVault>(leader);
        store.vault.paused = true;
        
        // Emit event
        event::emit(VaultPaused {
            leader,
            timestamp: get_current_timestamp(),
        });
    }

    // Deposit into vault with proper validation
    public entry fun deposit(account: &signer, leader: address, amount: u64) acquires LeaderVault {
        // Check if vault exists
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        
        let user = signer::address_of(account);
        let store = borrow_global_mut<LeaderVault>(leader);
        
        // Check if vault is paused
        assert!(!store.vault.paused, EVAULT_PAUSED);
        
        // Validate amount
        assert!(amount > 0, EINVALID_AMOUNT);
        
        // Check if user is authorized (either leader or subscriber)
        assert!(user == leader || is_subscriber(&store.vault, user), ENOT_AUTHORIZED);
        
        // Update balance (in real implementation, handle coin transfer)
        store.vault.balance = store.vault.balance + amount;
        
        // Emit event
        event::emit(DepositMade {
            user,
            leader,
            amount,
            timestamp: get_current_timestamp(),
        });
    }

    // Withdraw from vault with proper authorization
    public entry fun withdraw(account: &signer, leader: address, amount: u64) acquires LeaderVault {
        // Check if vault exists
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        
        let user = signer::address_of(account);
        let store = borrow_global_mut<LeaderVault>(leader);
        
        // Check if vault is paused
        assert!(!store.vault.paused, EVAULT_PAUSED);
        
        // Validate amount
        assert!(amount > 0, EINVALID_AMOUNT);
        
        // Check if user is authorized (either leader or subscriber)
        assert!(user == leader || is_subscriber(&store.vault, user), ENOT_AUTHORIZED);
        
        // Check sufficient balance
        assert!(store.vault.balance >= amount, EINSUFFICIENT_BALANCE);
        
        // Update balance
        store.vault.balance = store.vault.balance - amount;
        
        // Emit event
        event::emit(WithdrawalMade {
            user,
            leader,
            amount,
            timestamp: get_current_timestamp(),
        });
    }

    // Execute trade (leader only) with validation
    public entry fun execute_trade(account: &signer, trade_data: u64) acquires LeaderVault {
        let leader = signer::address_of(account);
        
        // Check if vault exists
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        
        let store = borrow_global_mut<LeaderVault>(leader);
        
        // Check if vault is paused
        assert!(!store.vault.paused, EVAULT_PAUSED);
        
        // Validate trade data
        assert!(trade_data > 0, EINVALID_AMOUNT);
        
        // Store trade signal
        vector::push_back(&mut store.vault.signals, trade_data);
        
        // Emit event
        event::emit(SignalPublished {
            leader,
            signal: trade_data,
            timestamp: get_current_timestamp(),
        });
    }

    // Resume vault (leader only)
    public entry fun resume_vault(account: &signer) acquires LeaderVault {
        let leader = signer::address_of(account);
        
        // Check if vault exists
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        
        let store = borrow_global_mut<LeaderVault>(leader);
        store.vault.paused = false;
        
        // Emit event
        event::emit(VaultResumed {
            leader,
            timestamp: get_current_timestamp(),
        });
    }

    // Update leader (requires both signers - limited by wallet support)
    // NOTE: This function is future-ready for multi-signer wallet support
    public entry fun update_leader(
        old_leader: &signer,
        new_leader: &signer
    ) acquires LeaderVault {
        let old_addr = signer::address_of(old_leader);
        let new_addr = signer::address_of(new_leader);
        
        // Check if old vault exists
        assert!(exists<LeaderVault>(old_addr), EVAULT_NOT_FOUND);
        
        // Check if new leader doesn't already have a vault
        assert!(!exists<LeaderVault>(new_addr), EVAULT_ALREADY_EXISTS);
        
        // Transfer vault ownership
        let LeaderVault { vault } = move_from<LeaderVault>(old_addr);
        let Vault {
            subscribers,
            balance,
            signals,
            paused,
            max_subscribers,
            created_at,
            leader: _,
        } = vault;

        let new_vault = Vault {
            leader: new_addr,
            subscribers,
            balance,
            signals,
            paused,
            max_subscribers,
            created_at,
        };
        
        move_to(new_leader, LeaderVault { vault: new_vault });
    }

    // View functions for querying vault state
    #[view]
    public fun get_vault_info(leader: address): (address, u64, u64, bool, u64) acquires LeaderVault {
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        let store = borrow_global<LeaderVault>(leader);
        (
            store.vault.leader,
            vector::length(&store.vault.subscribers),
            store.vault.balance,
            store.vault.paused,
            store.vault.created_at
        )
    }

    #[view]
    public fun get_subscribers(leader: address): vector<address> acquires LeaderVault {
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        let store = borrow_global<LeaderVault>(leader);
        store.vault.subscribers
    }

    #[view]
    public fun get_signals(leader: address): vector<u64> acquires LeaderVault {
        assert!(exists<LeaderVault>(leader), EVAULT_NOT_FOUND);
        let store = borrow_global<LeaderVault>(leader);
        store.vault.signals
    }

    // Test entry function for development
    public entry fun test_entry(_account: &signer) {
        // Test function - can be removed in production
    }
}