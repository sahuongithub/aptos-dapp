module vault_factory::VaultFactory {
    use std::vector;
    use std::signer;

    // The vault resource - includes store ability for account storage
    struct Vault has key, store {
        leader: address,
        subscribers: vector<address>,
        balance: u64,
        signals: vector<u64>,
        paused: bool,
    }

    struct LeaderVault has key, store {
        vault: Vault,
    }

    // Create a new vault (leader only)
    public entry fun create_vault(account: &signer) {
        let leader = signer::address_of(account);
        let vault = Vault {
            leader,
            subscribers: vector::empty<address>(),
            balance: 0,
            signals: vector::empty<u64>(),
            paused: false,
        };
        move_to(account, LeaderVault { vault });
    }

    // Join vault as subscriber
   public entry fun join_vault(account: &signer, leader: address) acquires LeaderVault {
        let store = borrow_global_mut<LeaderVault>(leader);
        vector::push_back(&mut store.vault.subscribers, signer::address_of(account));
    }

    // Leave vault as subscriber
    public entry fun leave_vault(account: &signer, leader: address) acquires LeaderVault {
        let store = borrow_global_mut<LeaderVault>(leader);
        let addr = signer::address_of(account);
        let subs = &mut store.vault.subscribers;
        let n = vector::length(subs);
        let  i = 0;
        let  found = false;
        while (i < n && !found) {
            if (*vector::borrow(subs, i) == addr) {
                vector::remove(subs, i);
                found = true;
            };
            i = i + 1;
        }
    }

    // Leader publishes a trading signal
    public entry fun publish_signal(account: &signer, signal: u64) acquires LeaderVault {
        let store = borrow_global_mut<LeaderVault>(signer::address_of(account));
        vector::push_back(&mut store.vault.signals, signal);
    }

    // Emergency pause (leader only)
    public entry fun emergency_pause(account: &signer) acquires LeaderVault {
        let store = borrow_global_mut<LeaderVault>(signer::address_of(account));
        store.vault.paused = true;
    }

    // Extend for coins/events/integration as needed!
    public entry fun test_entry(account: &signer) { }


    // Deposit into vault (demo: just updates vault balance)
public entry fun deposit(account: &signer, leader: address, amount: u64) acquires LeaderVault {
    let store = borrow_global_mut<LeaderVault>(leader);
    // For real coins, use coin transfer logic!
    store.vault.balance = store.vault.balance + amount;
}

// Withdraw from vault (demo: decreases balance if enough)
public entry fun withdraw(account: &signer, leader: address, amount: u64) acquires LeaderVault {
    let store = borrow_global_mut<LeaderVault>(leader);
    assert!(store.vault.balance >= amount, 1001); // Error code for insufficient balance
    store.vault.balance = store.vault.balance - amount;
}

// Execute trade (leader only, demo: pushes trade event to signals or executes logic)
public entry fun execute_trade(account: &signer, trade_data: u64) acquires LeaderVault {
    let store = borrow_global_mut<LeaderVault>(signer::address_of(account));
    // append trade data as a dummy, or integrate trading logic later
    vector::push_back(&mut store.vault.signals, trade_data);
}

// Resume vault (leader only)
public entry fun resume_vault(account: &signer) acquires LeaderVault {
    let store = borrow_global_mut<LeaderVault>(signer::address_of(account));
    store.vault.paused = false;
}

// Update leader (leader only)
public entry fun update_leader(
    old_leader: &signer,
    new_leader: &signer
) acquires LeaderVault {
    let old_addr = signer::address_of(old_leader);
    let LeaderVault { vault } = move_from<LeaderVault>(old_addr);
    let Vault {
        subscribers,
        balance,
        signals,
        paused,
        leader: _,
    } = vault;

    let vault = Vault {
        leader: signer::address_of(new_leader),
        subscribers,
        balance,
        signals,
        paused,
    };
    move_to(new_leader, LeaderVault { vault });
}



}

