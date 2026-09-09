package gordo.peluche.Repository;
import gordo.peluche.Entidades.Factura;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FacturaRepository extends JpaRepository<Factura, Long>{

}
