package gordo.peluche.Repository;

import gordo.peluche.Entidades.Cliente;

import org.springframework.data.jpa.repository.JpaRepository;


public interface ClienteRepository extends JpaRepository<Cliente, Long> {

}
